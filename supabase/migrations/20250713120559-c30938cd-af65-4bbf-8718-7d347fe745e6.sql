
-- Vérification et mise à jour de la structure des tables pour le système de transactions

-- 1. Mise à jour de la table wallets pour inclure des statistiques
ALTER TABLE public.wallets 
ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_earned NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_cashback NUMERIC DEFAULT 0.00;

-- 2. Mise à jour de la table payment_transactions pour une meilleure gestion
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS to_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS product_id UUID,
ADD COLUMN IF NOT EXISTS order_id UUID,
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cashback_amount NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS reference_type TEXT DEFAULT 'general';

-- 3. Mise à jour de la table admin_wallet pour plus de détails
ALTER TABLE public.admin_wallet 
ADD COLUMN IF NOT EXISTS pending_funds NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS available_funds NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_cashbacks_paid NUMERIC DEFAULT 0.00;

-- 4. Création d'une table pour l'historique des cashbacks si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.cashback_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  transaction_id UUID REFERENCES public.payment_transactions(id),
  order_id UUID,
  amount NUMERIC NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Création d'une table pour l'historique des commissions
CREATE TABLE IF NOT EXISTS public.commission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.payment_transactions(id),
  order_id UUID,
  seller_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL DEFAULT 0.00,
  commission_rate NUMERIC NOT NULL DEFAULT 5.00,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. Ajout d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON public.payment_transactions(type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_cashback_history_user_id ON public.cashback_history(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_history_seller_id ON public.commission_history(seller_id);

-- 7. Activation de RLS sur les nouvelles tables
ALTER TABLE public.cashback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_history ENABLE ROW LEVEL SECURITY;

-- 8. Policies pour cashback_history
CREATE POLICY "Users can view their own cashback history" 
  ON public.cashback_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all cashback history" 
  ON public.cashback_history 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert cashback records" 
  ON public.cashback_history 
  FOR INSERT 
  WITH CHECK (true);

-- 9. Policies pour commission_history
CREATE POLICY "Sellers can view their own commission history" 
  ON public.commission_history 
  FOR SELECT 
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all commission history" 
  ON public.commission_history 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert commission records" 
  ON public.commission_history 
  FOR INSERT 
  WITH CHECK (true);

-- 10. Fonction pour calculer les statistiques financières globales
CREATE OR REPLACE FUNCTION public.get_financial_statistics()
RETURNS TABLE(
  total_user_wallets NUMERIC,
  total_admin_funds NUMERIC,
  total_pending_funds NUMERIC,
  total_transactions_count INTEGER,
  total_commissions NUMERIC,
  total_cashbacks NUMERIC,
  daily_transactions JSONB,
  monthly_revenue JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
    ) as monthly_revenue
  FROM public.wallets w
  CROSS JOIN public.admin_wallet aw
  LEFT JOIN public.payment_transactions pt ON true
  GROUP BY aw.balance, aw.pending_funds;
END;
$$;

-- 11. Fonction pour mettre à jour les statistiques des wallets
CREATE OR REPLACE FUNCTION public.update_wallet_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mettre à jour les statistiques du wallet utilisateur
  IF NEW.type IN ('purchase', 'withdrawal') THEN
    UPDATE public.wallets 
    SET total_spent = total_spent + ABS(NEW.amount)
    WHERE user_id = NEW.user_id;
  END IF;
  
  IF NEW.type IN ('wallet_recharge', 'admin_recharge', 'cashback', 'refund') THEN
    UPDATE public.wallets 
    SET total_earned = total_earned + NEW.amount
    WHERE user_id = NEW.user_id;
  END IF;
  
  IF NEW.type = 'cashback' THEN
    UPDATE public.wallets 
    SET total_cashback = total_cashback + NEW.amount
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 12. Trigger pour mettre à jour automatiquement les statistiques
DROP TRIGGER IF EXISTS update_wallet_stats_trigger ON public.payment_transactions;
CREATE TRIGGER update_wallet_stats_trigger
  AFTER INSERT ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_statistics();
