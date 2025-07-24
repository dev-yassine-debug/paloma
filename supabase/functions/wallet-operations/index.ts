
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

    const { operation, user_id, amount, description_ar, description_en, to_user_id } = await req.json()

    console.log('Wallet operation request:', { operation, user_id, amount, to_user_id })

    if (operation === 'admin_transfer') {
      // Validation des paramètres
      if (!user_id || !amount || amount <= 0) {
        throw new Error('Paramètres invalides: user_id et amount > 0 requis')
      }

      console.log('Démarrage de la transaction de recharge admin pour user:', user_id)

      // 1. Vérifier et créer le wallet admin s'il n'existe pas
      let { data: adminWallet, error: adminError } = await supabaseClient
        .from('admin_wallet')
        .select('*')
        .single()

      if (adminError || !adminWallet) {
        console.log('Création du wallet admin avec solde initial')
        const { data: newAdminWallet, error: createError } = await supabaseClient
          .from('admin_wallet')
          .insert({ 
            balance: 10000, // Solde initial pour les tests
            total_commissions: 0, 
            total_transactions: 0,
            total_cashbacks_paid: 0,
            pending_funds: 0
          })
          .select()
          .single()
        
        if (createError) {
          throw new Error(`Erreur création wallet admin: ${createError.message}`)
        }
        adminWallet = newAdminWallet
      }

      // 2. Vérifier que l'admin a suffisamment de fonds
      if (adminWallet.balance < amount) {
        throw new Error(`Solde admin insuffisant. Disponible: ${adminWallet.balance}, Demandé: ${amount}`)
      }

      // 3. Transaction atomique - Débiter admin et créditer utilisateur
      const { data: transactionResult, error: transactionError } = await supabaseClient
        .rpc('update_wallet_balance', {
          p_user_id: user_id,
          p_amount: amount,
          p_transaction_type: 'admin_recharge',
          p_description_ar: description_ar || `شحن رصيد من الإدارة بمبلغ ${amount} ر.س`,
          p_description_en: description_en || `Admin wallet recharge of ${amount} SAR`,
          p_metadata: {
            operation: 'admin_transfer',
            admin_action: true,
            source: 'admin',
            admin_wallet_id: adminWallet.id,
            admin_balance_before: adminWallet.balance,
            admin_balance_after: adminWallet.balance - amount
          },
          p_reference_id: `admin-${Date.now()}`
        })

      if (transactionError) {
        console.error('Erreur transaction utilisateur:', transactionError)
        throw new Error(`خطأ في المعاملة: ${transactionError.message}`)
      }

      // 4. Débiter le wallet admin APRÈS succès du crédit utilisateur
      const { error: adminDebitError } = await supabaseClient
        .from('admin_wallet')
        .update({ 
          balance: adminWallet.balance - amount,
          total_transactions: (adminWallet.total_transactions || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminWallet.id)

      if (adminDebitError) {
        console.error('Erreur débit admin:', adminDebitError)
        // Rollback si possible
        throw new Error(`Erreur lors du débit admin: ${adminDebitError.message}`)
      }

      // Récupérer le nouveau solde utilisateur
      const { data: finalWallet, error: walletError } = await supabaseClient
        .from('wallets')
        .select('balance')
        .eq('user_id', user_id)
        .single()

      console.log('Recharge terminée avec succès:', {
        user_id,
        amount,
        new_balance: finalWallet?.balance,
        transaction_id: transactionResult
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'تم شحن الرصيد بنجاح',
          data: {
            amount,
            new_balance: finalWallet?.balance,
            transaction_id: transactionResult,
            admin_balance_remaining: adminWallet.balance - amount
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (operation === 'transfer') {
      // Transfer between users
      if (!to_user_id || !amount || amount <= 0) {
        throw new Error('Paramètres invalides pour le transfert')
      }

      // Get current user from auth
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        throw new Error('Non autorisé - Header manquant')
      }

      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
      
      if (userError || !user) {
        throw new Error('Utilisateur non authentifié')
      }

      const from_user_id = user.id

      console.log('Transfert entre utilisateurs:', { from_user_id, to_user_id, amount })

      // Vérifier le solde de l'expéditeur
      const { data: senderWallet, error: senderError } = await supabaseClient
        .from('wallets')
        .select('balance')
        .eq('user_id', from_user_id)
        .single()

      if (senderError || !senderWallet) {
        throw new Error('Wallet expéditeur introuvable')
      }

      if (senderWallet.balance < amount) {
        throw new Error(`Solde insuffisant. Disponible: ${senderWallet.balance}, Demandé: ${amount}`)
      }

      // Débiter l'expéditeur
      const { error: debitError } = await supabaseClient
        .rpc('update_wallet_balance', {
          p_user_id: from_user_id,
          p_amount: -amount,
          p_transaction_type: 'transfer_out',
          p_description_ar: description_ar || `تحويل إلى مستخدم آخر`,
          p_description_en: description_en || `Transfer to another user`,
          p_metadata: {
            operation: 'transfer',
            from_user_id,
            to_user_id,
            transfer_type: 'sent'
          },
          p_reference_id: `transfer-${Date.now()}`
        })

      if (debitError) {
        console.error('Erreur débit expéditeur:', debitError)
        throw new Error('خطأ في خصم المبلغ من المرسل')
      }

      // Créditer le destinataire
      const { error: creditError } = await supabaseClient
        .rpc('update_wallet_balance', {
          p_user_id: to_user_id,
          p_amount: amount,
          p_transaction_type: 'transfer_in',
          p_description_ar: description_ar || `تحويل من مستخدم آخر`,
          p_description_en: description_en || `Transfer from another user`,
          p_metadata: {
            operation: 'transfer',
            from_user_id,
            to_user_id,
            transfer_type: 'received'
          },
          p_reference_id: `transfer-${Date.now()}`
        })

      if (creditError) {
        console.error('Erreur crédit destinataire:', creditError)
        // Rollback du débit
        await supabaseClient
          .rpc('update_wallet_balance', {
            p_user_id: from_user_id,
            p_amount: amount,
            p_transaction_type: 'transfer_rollback',
            p_description_ar: 'استرداد تحويل فاشل',
            p_description_en: 'Failed transfer rollback',
            p_reference_id: `rollback-${Date.now()}`
          })
        
        throw new Error('خطأ في إضافة المبلغ للمستقبل')
      }

      console.log('Transfert terminé avec succès')

      return new Response(
        JSON.stringify({
          success: true,
          message: 'تم التحويل بنجاح',
          data: {
            amount,
            from_user_id,
            to_user_id
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('عملية غير مدعومة')

  } catch (error) {
    console.error('Erreur wallet operation:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'خطأ في العملية',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
