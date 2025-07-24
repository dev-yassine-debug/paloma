
-- Corriger la table payment_transactions pour inclure commission_amount
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC DEFAULT 0.00;

-- Améliorer la table admin_wallet
ALTER TABLE public.admin_wallet 
ADD COLUMN IF NOT EXISTS pending_funds NUMERIC DEFAULT 0.00;

-- Assurer la cohérence des triggers et fonctions
CREATE OR REPLACE FUNCTION public.update_commissions_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans commissions_history lors d'une transaction avec commission
  IF NEW.commission_amount > 0 AND NEW.type IN ('purchase', 'sale_income') THEN
    INSERT INTO public.commissions_history (
      order_id,
      buyer_id,
      seller_id,
      product_price,
      commission,
      cashback,
      admin_gain,
      total_paid,
      created_at
    ) VALUES (
      NEW.order_id,
      CASE WHEN NEW.type = 'purchase' THEN NEW.user_id ELSE NULL END,
      CASE WHEN NEW.type = 'sale_income' THEN NEW.user_id ELSE NULL END,
      NEW.amount,
      NEW.commission_amount,
      NEW.cashback_amount,
      NEW.commission_amount - NEW.cashback_amount,
      NEW.amount + NEW.commission_amount,
      NEW.created_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour commissions_history
DROP TRIGGER IF EXISTS update_commissions_history_trigger ON public.payment_transactions;
CREATE TRIGGER update_commissions_history_trigger
  AFTER INSERT ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_commissions_history();

-- Améliorer get_financial_statistics pour inclure tous les champs requis
CREATE OR REPLACE FUNCTION public.get_financial_statistics()
RETURNS TABLE(
  total_user_wallets NUMERIC,
  total_admin_funds NUMERIC, 
  total_pending_funds NUMERIC,
  total_transactions_count INTEGER,
  total_commissions NUMERIC,
  total_cashbacks NUMERIC,
  daily_transactions JSONB,
  monthly_revenue JSONB,
  admin_wallet_balance NUMERIC,
  total_sellers_balance NUMERIC,
  total_clients_balance NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(w.balance), 0) as total_user_wallets,
    COALESCE((SELECT balance FROM public.admin_wallet LIMIT 1), 0) as total_admin_funds,
    COALESCE((SELECT pending_funds FROM public.admin_wallet LIMIT 1), 0) as total_pending_funds,
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.payment_transactions), 0) as total_transactions_count,
    COALESCE((SELECT SUM(commission_amount) FROM public.payment_transactions WHERE commission_amount > 0), 0) as total_commissions,
    COALESCE((SELECT SUM(cashback_amount) FROM public.payment_transactions WHERE cashback_amount > 0), 0) as total_cashbacks,
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
$$;

-- Ajouter un champ is_service aux produits pour différencier produits/services
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_service BOOLEAN DEFAULT false;

-- Mettre à jour les produits existants selon leur type
UPDATE public.products 
SET is_service = (type = 'service') 
WHERE is_service IS NULL;
