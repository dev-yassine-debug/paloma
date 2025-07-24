
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AddFundsRequest {
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount }: AddFundsRequest = await req.json();

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
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validation
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Montant invalide" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (amount < 10) {
      return new Response(
        JSON.stringify({ error: "Le montant minimum est de 10 SAR" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (amount > 10000) {
      return new Response(
        JSON.stringify({ error: "Le montant maximum est de 10,000 SAR" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Processing add funds request:", { userId: user.id, amount });

    // Record pending transaction first
    const { data: transactionData, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        type: 'wallet_recharge',
        amount: amount,
        status: 'pending',
        category: 'recharge',
        description_ar: `شحن محفظة عبر Telr بمبلغ ${amount} ر.س`,
        description_en: `Wallet recharge via Telr for ${amount} SAR`,
        metadata: {
          source: 'telr',
          payment_gateway: 'telr'
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return new Response(
        JSON.stringify({ error: "خطأ في إنشاء المعاملة" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Call initiate-payment function
    const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
      'initiate-payment',
      {
        body: {
          amount: amount,
          userId: user.id,
          type: 'wallet_recharge',
          transactionId: transactionData.id
        }
      }
    );

    if (paymentError) {
      console.error("Error initiating payment:", paymentError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'initiation du paiement" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Payment initiated successfully:", paymentData);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: paymentData.paymentUrl,
        transactionRef: paymentData.transactionRef,
        orderRef: paymentData.orderRef,
        testMode: paymentData.testMode,
        message: "Redirection vers la page de paiement..."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in wallet-add-funds function:", error);
    return new Response(
      JSON.stringify({ error: `Erreur serveur: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
