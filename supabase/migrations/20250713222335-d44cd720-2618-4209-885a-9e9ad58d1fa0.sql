-- Corrections et améliorations du système de wallet
-- Vérification et ajout de contraintes manquantes

-- 1. Créer la fonction de mise à jour du wallet admin si elle n'existe pas
CREATE OR REPLACE FUNCTION update_admin_wallet_on_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Mise à jour du wallet admin quand il y a un transfert admin
  IF NEW.type = 'admin_recharge' THEN
    -- Débiter le wallet admin (montant négatif pour l'admin)
    INSERT INTO admin_wallet (id, balance, total_commissions, total_transactions)
    VALUES (gen_random_uuid(), -NEW.amount, 0, 1)
    ON CONFLICT (id) DO UPDATE SET
      balance = admin_wallet.balance - NEW.amount,
      total_transactions = admin_wallet.total_transactions + 1,
      updated_at = now();
      
    -- Si pas de wallet admin, en créer un avec solde illimité de départ
    IF NOT EXISTS (SELECT 1 FROM admin_wallet LIMIT 1) THEN
      INSERT INTO admin_wallet (balance, total_commissions, total_transactions)
      VALUES (1000000, 0, 1); -- Solde initial de 1M pour l'admin
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Créer le trigger pour mettre à jour le wallet admin
DROP TRIGGER IF EXISTS trigger_update_admin_wallet ON payment_transactions;
CREATE TRIGGER trigger_update_admin_wallet
  AFTER INSERT ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_wallet_on_transfer();

-- 3. Ajouter des colonnes manquantes aux wallets pour la traçabilité
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS total_sent NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_received NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_purchases NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_sales NUMERIC DEFAULT 0.00;

-- 4. Créer une vue pour l'audit complet des transactions
CREATE OR REPLACE VIEW transactions_audit_view AS
SELECT 
  pt.id,
  pt.user_id,
  pt.type,
  pt.amount,
  pt.status,
  pt.created_at,
  pt.description_ar,
  pt.description_en,
  pt.metadata,
  pt.from_user_id,
  pt.to_user_id,
  pt.product_id,
  pt.order_id,
  p_user.name as user_name,
  p_user.phone as user_phone,
  p_user.role as user_role,
  p_from.name as from_user_name,
  p_to.name as to_user_name,
  CASE 
    WHEN pt.type IN ('admin_recharge', 'wallet_recharge') THEN 'credit'
    WHEN pt.type IN ('purchase', 'withdrawal') THEN 'debit'
    ELSE 'neutral'
  END as transaction_category
FROM payment_transactions pt
LEFT JOIN profiles p_user ON pt.user_id = p_user.id
LEFT JOIN profiles p_from ON pt.from_user_id = p_from.id
LEFT JOIN profiles p_to ON pt.to_user_id = p_to.id;

-- 5. Créer une fonction pour générer des reçus automatiques
CREATE OR REPLACE FUNCTION generate_receipt_data(transaction_id UUID)
RETURNS JSON AS $$
DECLARE
  receipt_data JSON;
BEGIN
  SELECT json_build_object(
    'id', pt.id,
    'date', pt.created_at,
    'type', pt.type,
    'amount', pt.amount,
    'user_name', p.name,
    'user_phone', p.phone,
    'description', pt.description_ar,
    'status', pt.status,
    'metadata', pt.metadata
  ) INTO receipt_data
  FROM payment_transactions pt
  LEFT JOIN profiles p ON pt.user_id = p.id
  WHERE pt.id = transaction_id;
  
  RETURN receipt_data;
END;
$$ LANGUAGE plpgsql;

-- 6. Ajouter index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- 7. Mise à jour de la fonction financial statistics pour inclure plus de données
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