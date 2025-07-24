
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { cart_items, total_amount, payment_method } = await req.json()

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Validate wallet balance
    const { data: wallet } = await supabaseClient
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!wallet || wallet.balance < total_amount) {
      throw new Error('رصيد المحفظة غير كافي')
    }

    // Process each cart item and create orders
    const orders = []
    let totalCommission = 0
    let totalCashback = 0

    for (const item of cart_items) {
      // Get commission settings
      const { data: commissionSettings } = await supabaseClient
        .from('commission_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const commissionRate = commissionSettings?.customer_commission_percent || 5.0
      const cashbackRate = commissionSettings?.cashback_percent || 1.5

      const itemTotal = item.product_price * item.quantity
      const commission = itemTotal * (commissionRate / 100)
      const cashback = itemTotal * (cashbackRate / 100)

      // Create order
      const { data: order } = await supabaseClient
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: item.seller_id,
          product_id: item.product_id,
          quantity: item.quantity,
          product_price: item.product_price,
          total_amount: itemTotal + commission,
          commission: commission,
          cashback: cashback,
          admin_commission: commission - cashback,
          payment_method: payment_method,
          status: 'pending'
        })
        .select()
        .single()

      orders.push(order)
      totalCommission += commission
      totalCashback += cashback
    }

    // Update buyer wallet (deduct total amount + commission)
    const totalDeduction = total_amount + totalCommission
    await supabaseClient
      .from('wallets')
      .update({ balance: wallet.balance - totalDeduction })
      .eq('user_id', user.id)

    // Create payment transaction for buyer
    await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        amount: -totalDeduction,
        type: 'purchase',
        status: 'completed',
        description_ar: 'شراء منتجات من السوق',
        description_en: 'Purchase from marketplace',
        commission_amount: totalCommission,
        cashback_amount: totalCashback,
        metadata: {
          orders: orders.map(o => o.id),
          payment_method: payment_method
        }
      })

    // Add cashback to buyer wallet
    if (totalCashback > 0) {
      await supabaseClient
        .from('wallets')
        .update({ balance: wallet.balance - totalDeduction + totalCashback })
        .eq('user_id', user.id)

      // Create cashback transaction
      await supabaseClient
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount: totalCashback,
          type: 'cashback',
          status: 'completed',
          description_ar: 'كاشباك من عملية الشراء',
          description_en: 'Cashback from purchase',
          cashback_amount: totalCashback
        })
    }

    // Update admin wallet with commission
    const adminGain = totalCommission - totalCashback
    if (adminGain > 0) {
      const { data: adminWallet } = await supabaseClient
        .from('admin_wallet')
        .select('*')
        .single()

      if (adminWallet) {
        await supabaseClient
          .from('admin_wallet')
          .update({
            balance: adminWallet.balance + adminGain,
            total_commissions: adminWallet.total_commissions + totalCommission,
            total_transactions: adminWallet.total_transactions + 1
          })
          .eq('id', adminWallet.id)
      } else {
        await supabaseClient
          .from('admin_wallet')
          .insert({
            balance: adminGain,
            total_commissions: totalCommission,
            total_transactions: 1
          })
      }
    }

    // Clear cart
    await supabaseClient
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        orders: orders,
        total_amount: totalDeduction,
        commission: totalCommission,
        cashback: totalCashback,
        admin_gain: adminGain
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
