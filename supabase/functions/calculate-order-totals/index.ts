
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalculateOrderRequest {
  product_price: number;
  quantity: number;
  payment_method?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_price, quantity, payment_method = 'wallet' }: CalculateOrderRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get commission and cashback rates from settings
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['commission_rate', 'cashback_rate']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch settings" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const commissionRate = parseFloat(settings?.find(s => s.key === 'commission_rate')?.value || '5.0');
    const cashbackRate = parseFloat(settings?.find(s => s.key === 'cashback_rate')?.value || '1.5');

    // Calculate totals
    const subtotal = product_price * quantity;
    const commission = Math.round(subtotal * (commissionRate / 100) * 100) / 100;
    const total_amount = subtotal + commission;
    
    // Cashback only for wallet payments
    const cashback = payment_method === 'wallet' ? Math.round(total_amount * (cashbackRate / 100) * 100) / 100 : 0;
    const admin_gain = commission - cashback;

    console.log('Order calculation:', {
      subtotal,
      commission,
      total_amount,
      cashback,
      admin_gain,
      commission_rate: commissionRate,
      cashback_rate: cashbackRate
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          subtotal,
          commission,
          total_amount,
          cashback,
          admin_gain,
          commission_rate: commissionRate,
          cashback_rate: cashbackRate
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in calculate-order-totals function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
