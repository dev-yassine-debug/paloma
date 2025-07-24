
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

    console.log('Starting test data seeding...')

    // 1. Create test profiles
    const testProfiles = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'أحمد البائع',
        phone: '+966501234567',
        role: 'seller',
        city: 'الرياض'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'سارة العميلة',
        phone: '+966507654321',
        role: 'client',
        city: 'جدة'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'محمد المدير',
        phone: '+966509876543',
        role: 'admin',
        city: 'الدمام'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'فاطمة البائعة',
        phone: '+966502468135',
        role: 'seller',
        city: 'مكة'
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'خالد العميل',
        phone: '+966506543210',
        role: 'client',
        city: 'المدينة'
      }
    ]

    // Insert or update profiles
    for (const profile of testProfiles) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })
      
      if (profileError) {
        console.error('Error inserting profile:', profile.name, profileError)
      } else {
        console.log('Profile created/updated:', profile.name)
      }
    }

    // 2. Create wallets for each user
    const testWallets = [
      { user_id: '11111111-1111-1111-1111-111111111111', balance: 2500.00, total_earned: 3200.00, total_spent: 700.00, total_cashback: 0.00 },
      { user_id: '22222222-2222-2222-2222-222222222222', balance: 1800.00, total_earned: 2000.00, total_spent: 200.00, total_cashback: 95.50 },
      { user_id: '33333333-3333-3333-3333-333333333333', balance: 50000.00, total_earned: 50000.00, total_spent: 0.00, total_cashback: 0.00 },
      { user_id: '44444444-4444-4444-4444-444444444444', balance: 1200.00, total_earned: 1500.00, total_spent: 300.00, total_cashback: 0.00 },
      { user_id: '55555555-5555-5555-5555-555555555555', balance: 750.00, total_earned: 1000.00, total_spent: 250.00, total_cashback: 45.00 }
    ]

    for (const wallet of testWallets) {
      const { error: walletError } = await supabaseClient
        .from('wallets')
        .upsert(wallet, { onConflict: 'user_id' })
      
      if (walletError) {
        console.error('Error creating wallet:', wallet.user_id, walletError)
      } else {
        console.log('Wallet created/updated for user:', wallet.user_id)
      }
    }

    // 3. Create admin wallet
    const { error: adminWalletError } = await supabaseClient
      .from('admin_wallet')
      .upsert({
        balance: 45000.00,
        total_commissions: 5000.00,
        total_transactions: 25,
        total_cashbacks_paid: 140.50
      })

    if (adminWalletError) {
      console.error('Error creating admin wallet:', adminWalletError)
    } else {
      console.log('Admin wallet created/updated')
    }

    // 4. Create test products
    const testProducts = [
      {
        id: 'prod-1111-1111-1111-111111111111',
        name: 'هاتف ذكي سامسونج',
        description: 'هاتف ذكي حديث بمواصفات عالية',
        price: 1200.00,
        quantity: 10,
        category: 'إلكترونيات',
        seller_id: '11111111-1111-1111-1111-111111111111',
        status: 'approved',
        type: 'product'
      },
      {
        id: 'prod-2222-2222-2222-222222222222',
        name: 'خدمة صيانة كمبيوتر',
        description: 'خدمة صيانة وإصلاح أجهزة الكمبيوتر',
        price: 150.00,
        duration_hours: 2,
        category: 'خدمات',
        seller_id: '11111111-1111-1111-1111-111111111111',
        status: 'approved',
        type: 'service',
        available_days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
        start_time: '09:00:00',
        end_time: '17:00:00'
      },
      {
        id: 'prod-3333-3333-3333-333333333333',
        name: 'فستان أنيق',
        description: 'فستان نسائي أنيق للمناسبات',
        price: 250.00,
        quantity: 15,
        category: 'أزياء',
        seller_id: '44444444-4444-4444-4444-444444444444',
        status: 'approved',
        type: 'product'
      },
      {
        id: 'prod-4444-4444-4444-444444444444',
        name: 'خدمة تنظيف منزلي',
        description: 'خدمة تنظيف شاملة للمنازل',
        price: 200.00,
        duration_hours: 4,
        category: 'خدمات منزلية',
        seller_id: '44444444-4444-4444-4444-444444444444',
        status: 'approved',
        type: 'service',
        available_days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء'],
        start_time: '08:00:00',
        end_time: '16:00:00'
      }
    ]

    for (const product of testProducts) {
      const { error: productError } = await supabaseClient
        .from('products')
        .upsert(product, { onConflict: 'id' })
      
      if (productError) {
        console.error('Error creating product:', product.name, productError)
      } else {
        console.log('Product created/updated:', product.name)
      }
    }

    // 5. Create test orders and transactions
    const testOrders = [
      {
        id: 'order-1111-1111-1111-111111111111',
        buyer_id: '22222222-2222-2222-2222-222222222222',
        seller_id: '11111111-1111-1111-1111-111111111111',
        product_id: 'prod-1111-1111-1111-111111111111',
        quantity: 1,
        total_amount: 1200.00,
        original_amount: 1200.00,
        commission: 60.00,
        admin_commission: 60.00,
        cashback: 18.00,
        status: 'completed',
        payment_method: 'wallet',
        type: 'product'
      },
      {
        id: 'order-2222-2222-2222-222222222222',
        buyer_id: '55555555-5555-5555-5555-555555555555',
        seller_id: '44444444-4444-4444-4444-444444444444',
        product_id: 'prod-3333-3333-3333-333333333333',
        quantity: 1,
        total_amount: 250.00,
        original_amount: 250.00,
        commission: 12.50,
        admin_commission: 12.50,
        cashback: 3.75,
        status: 'completed',
        payment_method: 'wallet',
        type: 'product'
      }
    ]

    for (const order of testOrders) {
      const { error: orderError } = await supabaseClient
        .from('orders')
        .upsert(order, { onConflict: 'id' })
      
      if (orderError) {
        console.error('Error creating order:', order.id, orderError)
      } else {
        console.log('Order created/updated:', order.id)
      }
    }

    // 6. Create corresponding transactions
    const testTransactions = [
      // Purchase transaction for order 1
      {
        user_id: '22222222-2222-2222-2222-222222222222',
        amount: -1200.00,
        type: 'purchase',
        status: 'completed',
        description_ar: 'شراء هاتف ذكي سامسونج',
        description_en: 'Purchase of Samsung smartphone',
        order_id: 'order-1111-1111-1111-111111111111',
        product_id: 'prod-1111-1111-1111-111111111111',
        to_user_id: '11111111-1111-1111-1111-111111111111'
      },
      // Seller earning for order 1
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        amount: 1140.00,
        type: 'sale',
        status: 'completed',
        description_ar: 'بيع هاتف ذكي سامسونج',
        description_en: 'Sale of Samsung smartphone',
        order_id: 'order-1111-1111-1111-111111111111',
        product_id: 'prod-1111-1111-1111-111111111111',
        from_user_id: '22222222-2222-2222-2222-222222222222',
        commission_amount: 60.00
      },
      // Cashback for order 1
      {
        user_id: '22222222-2222-2222-2222-222222222222',
        amount: 18.00,
        type: 'cashback',
        status: 'completed',
        description_ar: 'كاشباك شراء هاتف ذكي',
        description_en: 'Cashback for smartphone purchase',
        order_id: 'order-1111-1111-1111-111111111111',
        cashback_amount: 18.00
      },
      // Admin transfer to client
      {
        user_id: '22222222-2222-2222-2222-222222222222',
        amount: 500.00,
        type: 'admin_recharge',
        status: 'completed',
        description_ar: 'شحن رصيد من الإدارة',
        description_en: 'Admin wallet recharge',
        from_user_id: '33333333-3333-3333-3333-333333333333'
      }
    ]

    for (const transaction of testTransactions) {
      const { error: transactionError } = await supabaseClient
        .from('payment_transactions')
        .insert(transaction)
      
      if (transactionError) {
        console.error('Error creating transaction:', transaction.type, transactionError)
      } else {
        console.log('Transaction created:', transaction.type, 'for user:', transaction.user_id)
      }
    }

    // 7. Create commission history
    const testCommissions = [
      {
        order_id: 'order-1111-1111-1111-111111111111',
        seller_id: '11111111-1111-1111-1111-111111111111',
        buyer_id: '22222222-2222-2222-2222-222222222222',
        product_price: 1200.00,
        commission: 60.00,
        cashback: 18.00,
        admin_gain: 42.00,
        total_paid: 1200.00
      },
      {
        order_id: 'order-2222-2222-2222-222222222222',
        seller_id: '44444444-4444-4444-4444-444444444444',
        buyer_id: '55555555-5555-5555-5555-555555555555',
        product_price: 250.00,
        commission: 12.50,
        cashback: 3.75,
        admin_gain: 8.75,
        total_paid: 250.00
      }
    ]

    for (const commission of testCommissions) {
      const { error: commissionError } = await supabaseClient
        .from('commissions_history')
        .insert(commission)
      
      if (commissionError) {
        console.error('Error creating commission:', commission.order_id, commissionError)
      } else {
        console.log('Commission created for order:', commission.order_id)
      }
    }

    console.log('Test data seeding completed successfully!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم إنشاء بيانات الاختبار بنجاح',
        data: {
          profiles: testProfiles.length,
          wallets: testWallets.length,
          products: testProducts.length,
          orders: testOrders.length,
          transactions: testTransactions.length,
          commissions: testCommissions.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in seed-test-data function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
