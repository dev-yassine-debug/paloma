
-- Corriger les relations entre payment_transactions et profiles
-- Ajouter les colonnes user_name, user_phone, user_role pour éviter les jointures complexes
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_phone TEXT,
ADD COLUMN IF NOT EXISTS user_role TEXT;

-- Mettre à jour les données existantes avec les informations des profils
UPDATE payment_transactions 
SET 
  user_name = p.name,
  user_phone = p.phone,
  user_role = p.role::text
FROM profiles p 
WHERE payment_transactions.user_id = p.id
AND (payment_transactions.user_name IS NULL OR payment_transactions.user_phone IS NULL);

-- Améliorer la fonction get_financial_statistics pour inclure les informations utilisateur
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
$function$;

-- Améliorer les politiques RLS pour payment_transactions
DROP POLICY IF EXISTS "Consolidated view transactions policy" ON payment_transactions;
CREATE POLICY "Admin and users can view transactions" 
ON payment_transactions FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR 
  auth.uid() = user_id
);

-- Trigger pour mettre à jour automatiquement les infos utilisateur dans payment_transactions
CREATE OR REPLACE FUNCTION update_payment_transaction_user_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les informations utilisateur lors de l'insertion
  IF TG_OP = 'INSERT' THEN
    UPDATE payment_transactions 
    SET 
      user_name = p.name,
      user_phone = p.phone,
      user_role = p.role::text
    FROM profiles p 
    WHERE payment_transactions.id = NEW.id 
    AND payment_transactions.user_id = p.id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS update_payment_user_info ON payment_transactions;
CREATE TRIGGER update_payment_user_info
  AFTER INSERT ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_transaction_user_info();

-- S'assurer qu'il n'y a qu'une seule ligne dans admin_wallet
DELETE FROM public.admin_wallet WHERE id NOT IN (
  SELECT id FROM public.admin_wallet LIMIT 1
);

-- Si aucune ligne n'existe, en créer une
INSERT INTO public.admin_wallet (balance, pending_funds, total_commissions, total_cashbacks_paid)
SELECT 0, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.admin_wallet);
