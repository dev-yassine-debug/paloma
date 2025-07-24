
-- Fix the get_financial_statistics function to resolve the missing FROM-clause error
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
    COALESCE((SELECT balance FROM public.admin_wallet LIMIT 1), 0) as total_admin_funds,
    COALESCE((SELECT pending_funds FROM public.admin_wallet LIMIT 1), 0) as total_pending_funds,
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.payment_transactions), 0) as total_transactions_count,
    COALESCE((SELECT SUM(commission_amount) FROM public.payment_transactions WHERE commission_amount IS NOT NULL), 0) as total_commissions,
    COALESCE((SELECT SUM(cashback_amount) FROM public.payment_transactions WHERE cashback_amount IS NOT NULL), 0) as total_cashbacks,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'date', daily_stats.date,
          'count', daily_stats.daily_count,
          'amount', daily_stats.daily_amount
        )
      )
      FROM (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as daily_count,
          SUM(amount) as daily_amount
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
          'month', monthly_stats.month,
          'revenue', monthly_stats.revenue,
          'commissions', monthly_stats.commissions
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
    COALESCE((SELECT balance FROM public.admin_wallet LIMIT 1), 0) as admin_wallet_balance,
    COALESCE((
      SELECT SUM(w.balance) 
      FROM public.wallets w 
      JOIN public.profiles p ON w.user_id = p.id 
      WHERE p.role = 'seller'
    ), 0) as total_sellers_balance,
    COALESCE((
      SELECT SUM(w.balance) 
      FROM public.wallets w 
      JOIN public.profiles p ON w.user_id = p.id 
      WHERE p.role = 'client'
    ), 0) as total_clients_balance
  FROM public.wallets w;
END;
$function$
