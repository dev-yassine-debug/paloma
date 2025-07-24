-- Améliorer la table payment_transactions avec des contraintes et metadata plus robustes
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

-- Améliorer l'index sur metadata pour les recherches par source
CREATE INDEX IF NOT EXISTS idx_payment_transactions_metadata_source 
ON public.payment_transactions USING GIN ((metadata->>'source'));

-- Ajouter un index pour les requêtes administratives
CREATE INDEX IF NOT EXISTS idx_payment_transactions_admin_queries 
ON public.payment_transactions (type, status, created_at DESC);

-- Créer une vue pour l'audit des wallets avec plus de détails
CREATE OR REPLACE VIEW public.wallet_audit_detailed AS
SELECT 
    w.id as wallet_id,
    w.user_id,
    p.name as user_name,
    p.phone,
    p.role,
    w.balance,
    w.version,
    w.created_at as wallet_created,
    w.updated_at as wallet_updated,
    pt.id as last_transaction_id,
    pt.type as last_transaction_type,
    pt.amount as last_transaction_amount,
    pt.created_at as last_transaction_date,
    pt.metadata->>'source' as last_transaction_source,
    pt.status as last_transaction_status
FROM public.wallets w
LEFT JOIN public.profiles p ON w.user_id = p.id
LEFT JOIN public.payment_transactions pt ON w.last_transaction_id = pt.id;

-- Politique RLS pour la vue détaillée
ALTER VIEW public.wallet_audit_detailed OWNER TO postgres;

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