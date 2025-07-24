
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Non autorisé')
    }

    // Vérifier que l'utilisateur est admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Accès refusé - Admin requis')
    }

    const { order_id, action } = await req.json() // action: 'approve' ou 'reject'

    console.log('Finalizing transaction:', { order_id, action })

    // Obtenir les détails de la commande
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*, products!inner(name, seller_id)')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      throw new Error('Commande non trouvée')
    }

    if (action === 'approve') {
      // Approuver la transaction
      
      // 1. Transférer les fonds au vendeur (moins la commission)
      const sellerAmount = order.product_price * order.quantity // Prix original sans commission
      
      const { error: sellerTransferError } = await supabaseClient
        .rpc('update_wallet_balance', {
          p_user_id: order.seller_id,
          p_amount: sellerAmount,
          p_transaction_type: 'sale_income',
          p_description_ar: `بيع ${order.products.name}`,
          p_description_en: `Sale of ${order.products.name}`,
          p_metadata: {
            order_id: order.id,
            buyer_id: order.buyer_id,
            commission_deducted: order.commission
          },
          p_reference_id: order.id
        })

      if (sellerTransferError) {
        console.error('Erreur transfert vendeur:', sellerTransferError)
        throw new Error('Erreur lors du transfert au vendeur')
      }

      // 2. Transférer le cashback à l'acheteur
      const { error: cashbackTransferError } = await supabaseClient
        .rpc('update_wallet_balance', {
          p_user_id: order.buyer_id,
          p_amount: order.cashback,
          p_transaction_type: 'cashback',
          p_description_ar: `استرداد نقدي لشراء ${order.products.name}`,
          p_description_en: `Cashback for purchase of ${order.products.name}`,
          p_metadata: {
            order_id: order.id,
            seller_id: order.seller_id
          },
          p_reference_id: order.id
        })

      if (cashbackTransferError) {
        console.error('Erreur cashback:', cashbackTransferError)
      }

      // 3. Mettre à jour admin_wallet (retirer pending_funds, ajouter commission aux fonds disponibles)
      const { error: adminWalletError } = await supabaseClient
        .from('admin_wallet')
        .upsert({
          pending_funds: supabaseClient.raw(`COALESCE(pending_funds, 0) - ${order.total_amount}`),
          balance: supabaseClient.raw(`COALESCE(balance, 0) + ${order.commission}`),
          total_commissions: supabaseClient.raw(`COALESCE(total_commissions, 0) + ${order.commission}`),
          total_cashbacks_paid: supabaseClient.raw(`COALESCE(total_cashbacks_paid, 0) + ${order.cashback}`),
          total_transactions: supabaseClient.raw(`COALESCE(total_transactions, 0) + 1`),
          updated_at: new Date().toISOString()
        })

      if (adminWalletError) {
        console.error('Erreur admin wallet update:', adminWalletError)
      }

      // 4. Mettre à jour les historiques
      await supabaseClient
        .from('commission_history')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('order_id', order.id)

      await supabaseClient
        .from('cashback_history')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('order_id', order.id)

      // 5. Mettre à jour le statut de la commande
      await supabaseClient
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id)

      console.log('Transaction approved successfully')

    } else if (action === 'reject') {
      // Rejeter la transaction et rembourser l'acheteur
      
      // 1. Rembourser l'acheteur
      const { error: refundError } = await supabaseClient
        .rpc('update_wallet_balance', {
          p_user_id: order.buyer_id,
          p_amount: order.total_amount,
          p_transaction_type: 'refund',
          p_description_ar: `استرداد مبلغ الطلب ${order.products.name}`,
          p_description_en: `Refund for order ${order.products.name}`,
          p_metadata: {
            order_id: order.id,
            original_amount: order.total_amount
          },
          p_reference_id: order.id
        })

      if (refundError) {
        console.error('Erreur remboursement:', refundError)
        throw new Error('Erreur lors du remboursement')
      }

      // 2. Retirer les fonds des pending_funds de l'admin
      await supabaseClient
        .from('admin_wallet')
        .upsert({
          pending_funds: supabaseClient.raw(`COALESCE(pending_funds, 0) - ${order.total_amount}`),
          updated_at: new Date().toISOString()
        })

      // 3. Marquer les historiques comme annulés
      await supabaseClient
        .from('commission_history')
        .update({
          status: 'cancelled',
          processed_at: new Date().toISOString()
        })
        .eq('order_id', order.id)

      await supabaseClient
        .from('cashback_history')
        .update({
          status: 'cancelled',
          processed_at: new Date().toISOString()
        })
        .eq('order_id', order.id)

      // 4. Mettre à jour le statut de la commande
      await supabaseClient
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)

      console.log('Transaction rejected and refunded successfully')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: action === 'approve' ? 'تم تأكيد المعاملة بنجاح' : 'تم إلغاء المعاملة واسترداد المبلغ',
        data: {
          order_id: order.id,
          action: action,
          status: action === 'approve' ? 'completed' : 'cancelled'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erreur finalize transaction:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'خطأ في إنهاء المعاملة',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
