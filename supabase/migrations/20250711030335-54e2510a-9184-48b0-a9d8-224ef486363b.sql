-- Améliorer la table payment_transactions avec des contraintes
ALTER TABLE public.payment_transactions 
DROP CONSTRAINT IF EXISTS payment_transactions_type_check;

-- Ajouter des contraintes de type pour s'assurer de la validité des données
ALTER TABLE public.payment_transactions 
ADD CONSTRAINT payment_transactions_type_check 
CHECK (type IN ('wallet_recharge', 'purchase', 'withdrawal', 'refund', 'admin_recharge', 'commission', 'cashback'));

ALTER TABLE public.payment_transactions 
DROP CONSTRAINT IF EXISTS payment_transactions_status_check;

ALTER TABLE public.payment_transactions 
ADD CONSTRAINT payment_transactions_status_check 
CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));

-- Ajouter un index simple pour les requêtes administratives
CREATE INDEX IF NOT EXISTS idx_payment_transactions_admin_queries 
ON public.payment_transactions (type, status, created_at DESC);

-- Ajouter un index pour user_id et type
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_type 
ON public.payment_transactions (user_id, type, created_at DESC);

-- Fonction pour obtenir les statistiques de wallet globales
CREATE OR REPLACE FUNCTION public.get_wallet_statistics()
RETURNS TABLE(
    total_users_with_wallets INTEGER,
    total_balance NUMERIC,
    total_transactions INTEGER,
    avg_balance NUMERIC,
    total_admin_recharges NUMERIC,
    total_telr_recharges NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT w.user_id)::INTEGER as total_users_with_wallets,
        COALESCE(SUM(w.balance), 0) as total_balance,
        COUNT(pt.id)::INTEGER as total_transactions,
        COALESCE(AVG(w.balance), 0) as avg_balance,
        COALESCE(SUM(CASE WHEN pt.type = 'admin_recharge' THEN pt.amount ELSE 0 END), 0) as total_admin_recharges,
        COALESCE(SUM(CASE WHEN pt.metadata->>'source' = 'telr' THEN pt.amount ELSE 0 END), 0) as total_telr_recharges
    FROM public.wallets w
    LEFT JOIN public.payment_transactions pt ON pt.user_id = w.user_id;
END;
$$;