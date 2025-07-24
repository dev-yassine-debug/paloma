
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  product_id: string;
  quantity: number;
  payment_method: 'wallet' | 'telr' | 'cash' | 'face_to_face';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_id, quantity, payment_method }: CreateOrderRequest = await req.json();
    
    console.log('Création commande:', { product_id, quantity, payment_method });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Vérifier que l'utilisateur est un client
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'client') {
      return new Response(
        JSON.stringify({ error: "Only clients can create orders" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Récupérer les détails du produit
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('status', 'approved')
      .single();

    if (productError || !product) {
      console.error('Produit non trouvé:', productError);
      return new Response(
        JSON.stringify({ error: "Product not found or not approved" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Vérifier la disponibilité du stock
    if (product.quantity < quantity) {
      return new Response(
        JSON.stringify({ error: "Insufficient stock" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculer les totaux avec commission
    const { data: calculations, error: calcError } = await supabase
      .rpc('calculate_order_totals', {
        product_price: product.price,
        quantity: quantity,
        payment_method: payment_method
      });

    if (calcError || !calculations || calculations.length === 0) {
      console.error('Erreur calcul totaux:', calcError);
      return new Response(
        JSON.stringify({ error: "Failed to calculate order totals" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const totals = calculations[0];
    console.log('Totaux calculés:', totals);

    // Vérifier le solde du wallet si paiement par wallet
    if (payment_method === 'wallet') {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!wallet || wallet.balance < totals.total_amount) {
        return new Response(
          JSON.stringify({ error: "Insufficient wallet balance" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Créer la commande - CORRECTION: statut 'pending' pour toutes les méthodes
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id: product_id,
        quantity: quantity,
        payment_method: payment_method,
        total_amount: totals.total_amount,
        commission: totals.commission,
        cashback: totals.cashback || 0,
        original_amount: totals.subtotal,
        status: 'pending' // CORRECTION: Toujours pending au début
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erreur création commande:', orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Commande créée:', order);

    // Traitement différé selon la méthode de paiement
    if (payment_method === 'wallet') {
      try {
        // Déduire du wallet de l'acheteur
        await supabase.rpc('update_wallet_balance', {
          p_user_id: user.id,
          p_amount: -totals.total_amount,
          p_transaction_type: 'purchase',
          p_description_ar: `شراء ${product.name}`,
          p_description_en: `Purchase of ${product.name}`,
          p_metadata: {
            order_id: order.id,
            product_id: product_id,
            quantity: quantity
          },
          p_reference_id: order.id
        });

        // CORRECTION: Le vendeur reçoit l'argent seulement après confirmation
        // Mais on prépare déjà les transactions pour traçabilité
        
        // Décrémenter le stock
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            quantity: product.quantity - quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', product_id);

        if (stockError) {
          console.error('Erreur mise à jour stock:', stockError);
        }

        console.log('Paiement wallet traité avec succès');

      } catch (error) {
        console.error('Erreur traitement paiement:', error);
        
        // Annuler la commande en cas d'erreur
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', order.id);
          
        return new Response(
          JSON.stringify({ error: "Payment processing failed" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Créer une notification pour le vendeur
    await supabase
      .from('notifications')
      .insert({
        user_id: product.seller_id,
        title: 'طلب جديد',
        message: `لديك طلب جديد للمنتج ${product.name}`,
        type: 'order',
        metadata: {
          order_id: order.id,
          product_name: product.name,
          quantity: quantity,
          buyer_name: profile?.name || 'عميل'
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: order,
        totals: totals,
        message: "Order created successfully, awaiting seller confirmation"
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in create-order function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
