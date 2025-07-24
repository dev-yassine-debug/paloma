
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessOrderRequest {
  order_id: string;
  action: 'confirm' | 'cancel';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, action }: ProcessOrderRequest = await req.json();

    console.log('Processing order:', { order_id, action });

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

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          id, name, price, seller_id, type
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user has permission to process this order
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Permission denied" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === 'confirm') {
      // Only buyer can confirm delivery
      if (order.buyer_id !== user.id) {
        return new Response(
          JSON.stringify({ error: "Only buyer can confirm delivery" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (order.status !== 'delivered') {
        return new Response(
          JSON.stringify({ error: "Order must be delivered first" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Utiliser la nouvelle fonction corrigée pour confirmer la livraison
      const { data: confirmResult, error: confirmError } = await supabase.rpc('confirm_order_delivery', {
        p_order_id: order_id,
        p_buyer_id: user.id
      });

      if (confirmError) {
        console.error('Error confirming order delivery:', confirmError);
        return new Response(
          JSON.stringify({ error: "Failed to confirm order delivery" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log('Order confirmed successfully:', confirmResult);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Order confirmed and payments processed",
          data: {
            seller_payment: confirmResult.seller_payment,
            buyer_cashback: confirmResult.buyer_cashback
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } else if (action === 'cancel') {
      if (order.status !== 'pending') {
        return new Response(
          JSON.stringify({ error: "Order cannot be cancelled" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Refund to buyer if payment was made
      if (order.payment_method === 'wallet' && order.total_amount > 0) {
        const { error: refundError } = await supabase.rpc('update_wallet_balance', {
          p_user_id: order.buyer_id,
          p_amount: order.total_amount,
          p_transaction_type: 'refund',
          p_description_ar: `استرداد لإلغاء طلب ${order.products.name}`,
          p_description_en: `Refund for cancelled order ${order.products.name}`,
          p_metadata: {
            order_id: order.id,
            product_id: order.product_id,
            cancelled_by: user.id === order.buyer_id ? 'buyer' : 'seller'
          },
          p_reference_id: order.id
        });

        if (refundError) {
          console.error('Error processing refund:', refundError);
          return new Response(
            JSON.stringify({ error: "Failed to process refund" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      // Restore product quantity if it's a product
      if (order.products.type === 'product') {
        await supabase
          .from('products')
          .update({
            quantity: supabase.sql`quantity + ${order.quantity}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.product_id);
      }

      // Cancel pending cashback
      await supabase
        .from('cashback_history')
        .update({
          status: 'cancelled',
          processed_at: new Date().toISOString()
        })
        .eq('order_id', order_id)
        .eq('status', 'pending');

      // Update order status
      await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id);

      console.log('Order cancelled successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: "Order cancelled and refund processed",
          refund_amount: order.total_amount
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

export default handler;
