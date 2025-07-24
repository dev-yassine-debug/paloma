
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { cart_items } = await req.json()

    if (!cart_items || cart_items.length === 0) {
      return new Response(
        JSON.stringify({
          subtotal: 0,
          commission: 0,
          total: 0,
          cashback: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Get commission settings
    const { data: commissionSettings } = await supabaseClient
      .from('commission_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const commissionRate = commissionSettings?.customer_commission_percent || 5.0
    const cashbackRate = commissionSettings?.cashback_percent || 1.5

    // Calculate totals
    const subtotal = cart_items.reduce((sum: number, item: any) => {
      return sum + (item.product_price * item.quantity)
    }, 0)

    const commission = subtotal * (commissionRate / 100)
    const total = subtotal + commission
    const cashback = total * (cashbackRate / 100)

    return new Response(
      JSON.stringify({
        subtotal: Number(subtotal.toFixed(2)),
        commission: Number(commission.toFixed(2)),
        total: Number(total.toFixed(2)),
        cashback: Number(cashback.toFixed(2)),
        commission_rate: commissionRate,
        cashback_rate: cashbackRate
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Calculate totals error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        subtotal: 0,
        commission: 0,
        total: 0,
        cashback: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
