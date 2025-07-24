
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

    const { 
      orderId, 
      buyerId, 
      sellerId, 
      productId, 
      quantity, 
      productPrice,
      paymentMethod = 'wallet'
    } = await req.json()

    console.log('Processing purchase:', { orderId, buyerId, sellerId, productId, quantity, productPrice })

    // Utiliser la nouvelle fonction corrigée qui ne donne pas le cashback immédiatement
    const { data: result, error: processError } = await supabaseClient.rpc('process_purchase_payment', {
      p_order_id: orderId,
      p_buyer_id: buyerId,
      p_seller_id: sellerId,
      p_product_id: productId,
      p_quantity: quantity,
      p_product_price: productPrice,
      p_payment_method: paymentMethod
    })

    if (processError) {
      console.error('Error processing purchase:', processError)
      throw new Error(`Erreur traitement achat: ${processError.message}`)
    }

    console.log('Purchase processed successfully:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        commission: result.commission,
        cashback_pending: result.cashback_pending,
        total_amount: result.total_amount,
        message: 'Purchase processed successfully, cashback pending confirmation'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in process-purchase:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors du traitement de l\'achat',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
