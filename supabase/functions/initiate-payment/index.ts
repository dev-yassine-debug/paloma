
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  userId: string;
  type: "wallet_recharge" | "direct_payment";
  orderId?: string;
  transactionId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, userId, type, orderId, transactionId }: PaymentRequest = await req.json();

    console.log("Initiating payment:", { amount, userId, type, orderId, transactionId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validation
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "مبلغ غير صالح" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "معرف المستخدم مطلوب" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Telr configuration
    const telrStoreId = Deno.env.get("TELR_STORE_ID") || "test_store";
    const telrAuthKey = Deno.env.get("TELR_AUTH_KEY") || "test_auth_key";
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";
    
    // Generate unique transaction reference
    const transactionRef = transactionId || `TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderRef = orderId || `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Security token for webhook validation
    const securityToken = `SEC_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // Update transaction with security token
    if (transactionId) {
      await supabase
        .from("payment_transactions")
        .update({
          transaction_id: transactionRef,
          metadata: {
            telr_reference: transactionRef,
            order_reference: orderRef,
            security_token: securityToken,
            payment_gateway: "telr",
            initiated_at: new Date().toISOString()
          }
        })
        .eq("id", transactionId);
    }

    // Prepare Telr payment request
    const telrPayload = {
      method: "create",
      store: telrStoreId,
      authkey: telrAuthKey,
      order: {
        cartid: orderRef,
        test: "1", // Set to "0" for production
        amount: amount.toFixed(2),
        currency: "SAR",
        description: type === "wallet_recharge" 
          ? `شحن محفظة بمبلغ ${amount} ر.س`
          : `دفع مباشر بمبلغ ${amount} ر.س`
      },
      return: {
        authorised: `${frontendUrl}/payment-success?transaction_id=${transactionRef}&token=${securityToken}`,
        declined: `${frontendUrl}/payment-failed?transaction_id=${transactionRef}&token=${securityToken}`,
        cancelled: `${frontendUrl}/payment-cancelled?transaction_id=${transactionRef}&token=${securityToken}`
      },
      webhook: {
        url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/telr-webhook?transaction_id=${transactionRef}&token=${securityToken}`,
        email: "admin@yourstore.com"
      }
    };

    console.log("Telr payload:", JSON.stringify(telrPayload, null, 2));

    // Call Telr API
    const telrResponse = await fetch("https://secure.telr.com/gateway/order.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(telrPayload),
    });

    const telrResult = await telrResponse.json();
    console.log("Telr response:", telrResult);

    if (!telrResponse.ok || !telrResult.order) {
      console.error("Telr API error:", telrResult);
      return new Response(
        JSON.stringify({ 
          error: "فشل في إنشاء طلب الدفع",
          details: telrResult.error || "خطأ غير معروف"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Extract payment URL
    const paymentUrl = telrResult.order.url;
    const telrOrderRef = telrResult.order.ref;

    if (!paymentUrl) {
      return new Response(
        JSON.stringify({ error: "لم يتم الحصول على رابط الدفع" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Log successful initiation
    console.log("Payment initiated successfully:", {
      transactionRef,
      telrOrderRef,
      paymentUrl,
      amount,
      type
    });

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: paymentUrl,
        transactionRef: transactionRef,
        orderRef: orderRef,
        telrOrderRef: telrOrderRef,
        testMode: true,
        message: "تم إنشاء طلب الدفع بنجاح"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in initiate-payment function:", error);
    return new Response(
      JSON.stringify({ 
        error: `خطأ في الخادم: ${error.message}`,
        details: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
