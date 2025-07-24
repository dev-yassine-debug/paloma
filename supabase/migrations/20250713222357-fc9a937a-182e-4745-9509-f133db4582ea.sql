-- Correction de l'erreur de migration - Supprimer et recréer la fonction
DROP FUNCTION IF EXISTS public.get_financial_statistics();

-- Recréer la fonction avec les nouvelles colonnes
CREATE OR REPLACE FUNCTION public.get_financial_statistics()
RETURNS TABLE(
  total_user_wallets numeric, 
  total_admin_funds numeric, 
  total_pending_funds numeric, 
  total_transactions_count integer, 
  total_commissions numeric, 
  total_cashbacks numeric, 
  daily_transactions jsonb, 
  monthly_revenue jsonb,
  admin_wallet_balance numeric,
  total_sellers_balance numeric,
  total_clients_balance numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(w.balance), 0) as total_user_wallets,
    COALESCE(aw.balance, 0) as total_admin_funds,
    COALESCE(aw.pending_funds, 0) as total_pending_funds,
    COUNT(pt.id)::INTEGER as total_transactions_count,
    COALESCE(SUM(pt.commission_amount), 0) as total_commissions,
    COALESCE(SUM(pt.cashback_amount), 0) as total_cashbacks,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'date', DATE(created_at),
          'count', count,
          'amount', amount
        )
      )
      FROM (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          SUM(amount) as amount
        FROM public.payment_transactions 
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) daily_stats), 
      '[]'::jsonb
    ) as daily_transactions,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'month', month,
          'revenue', revenue,
          'commissions', commissions
        )
      )
      FROM (
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM') as month,
          SUM(amount) as revenue,
          SUM(commission_amount) as commissions
        FROM public.payment_transactions 
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month
      ) monthly_stats), 
      '[]'::jsonb
    ) as monthly_revenue,
    COALESCE(aw.balance, 0) as admin_wallet_balance,
    COALESCE((
      SELECT SUM(w.balance) 
      FROM wallets w 
      JOIN profiles p ON w.user_id = p.id 
      WHERE p.role = 'seller'
    ), 0) as total_sellers_balance,
    COALESCE((
      SELECT SUM(w.balance) 
      FROM wallets w 
      JOIN profiles p ON w.user_id = p.id 
      WHERE p.role = 'client'
    ), 0) as total_clients_balance
  FROM public.wallets w
  CROSS JOIN public.admin_wallet aw
  LEFT JOIN public.payment_transactions pt ON true
  GROUP BY aw.balance, aw.pending_funds;
END;
$function$;