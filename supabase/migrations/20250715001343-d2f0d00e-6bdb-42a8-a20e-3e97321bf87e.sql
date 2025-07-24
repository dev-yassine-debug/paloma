
-- Correction de la fonction get_financial_statistics pour résoudre l'erreur de colonne ambiguë
DROP FUNCTION IF EXISTS public.get_financial_statistics();

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
    COALESCE((SELECT SUM(commission_amount) FROM public.payment_transactions), 0) as total_commissions,
    COALESCE((SELECT SUM(cashback_amount) FROM public.payment_transactions), 0) as total_cashbacks,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'date', DATE(pt.created_at),
          'count', daily_count,
          'amount', daily_amount
        )
      )
      FROM (
        SELECT 
          DATE(pt.created_at) as date,
          COUNT(*) as daily_count,
          SUM(pt.amount) as daily_amount
        FROM public.payment_transactions pt
        WHERE pt.created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(pt.created_at)
        ORDER BY DATE(pt.created_at)
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
          TO_CHAR(pt.created_at, 'YYYY-MM') as month,
          SUM(pt.amount) as revenue,
          SUM(pt.commission_amount) as commissions
        FROM public.payment_transactions pt
        WHERE pt.created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY TO_CHAR(pt.created_at, 'YYYY-MM')
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
  FROM public.wallets w
  GROUP BY ();
END;
$function$;

-- Correction du problème admin_wallet (plusieurs lignes)
-- S'assurer qu'il n'y a qu'une seule ligne dans admin_wallet
DELETE FROM public.admin_wallet WHERE id NOT IN (
  SELECT id FROM public.admin_wallet LIMIT 1
);

-- Si aucune ligne n'existe, en créer une
INSERT INTO public.admin_wallet (balance, pending_funds, total_commissions, total_cashbacks_paid)
SELECT 0, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.admin_wallet);
