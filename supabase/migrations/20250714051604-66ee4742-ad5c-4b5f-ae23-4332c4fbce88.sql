
-- ÉTAPE 1: CONSOLIDATION DES TABLES EN DOUBLON

-- 1.1 Fusion des tables de commissions (garder commissions_history, la plus complète)
-- Ajouter les colonnes manquantes de commission_history si nécessaire
ALTER TABLE commissions_history 
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Migrer les données de commission_history vers commissions_history (si elle contient des données)
INSERT INTO commissions_history (
  order_id, seller_id, amount, commission_rate, status, created_at, processed_at, metadata
)
SELECT 
  order_id, 
  seller_id, 
  amount, 
  commission_rate, 
  status, 
  created_at, 
  processed_at, 
  metadata
FROM commission_history 
WHERE NOT EXISTS (
  SELECT 1 FROM commissions_history ch 
  WHERE ch.order_id = commission_history.order_id 
  AND ch.seller_id = commission_history.seller_id
);

-- 1.2 Fusion des tables de transactions (garder payment_transactions, la plus complète)
-- Migrer les données de payment_transaction vers payment_transactions
INSERT INTO payment_transactions (
  id, user_id, amount, type, status, provider, transaction_id, category, 
  description_ar, description_en, admin_commission, metadata, created_at, updated_at
)
SELECT 
  id, user_id, amount, type, status, provider, transaction_id, category,
  description_ar, description_en, admin_commission, metadata, created_at, updated_at
FROM payment_transaction 
WHERE NOT EXISTS (
  SELECT 1 FROM payment_transactions pt 
  WHERE pt.id = payment_transaction.id
);

-- 1.3 Fusion des tables de portefeuilles (garder wallets, la plus complète)
-- Migrer les données de wallet vers wallets
INSERT INTO wallets (
  id, user_id, balance, created_at, updated_at, last_transaction_id, version
)
SELECT 
  id, user_id, balance, created_at, updated_at, last_transaction_id, version
FROM wallet 
WHERE NOT EXISTS (
  SELECT 1 FROM wallets w 
  WHERE w.user_id = wallet.user_id
);

-- ÉTAPE 2: CRÉATION DES VUES MÉTIER AVEC JOINTURES

-- 2.1 Vue complète des portefeuilles avec informations utilisateur
CREATE OR REPLACE VIEW wallets_view AS
SELECT 
  w.id as wallet_id,
  w.user_id,
  w.balance,
  w.total_earned,
  w.total_spent,
  w.total_cashback,
  w.version,
  w.last_transaction_id,
  w.created_at as wallet_created,
  w.updated_at as wallet_updated,
  p.name as user_name,
  p.phone,
  p.role,
  p.city,
  pt.amount as last_transaction_amount,
  pt.type as last_transaction_type,
  pt.created_at as last_transaction_date
FROM wallets w
LEFT JOIN profiles p ON w.user_id = p.id
LEFT JOIN payment_transactions pt ON w.last_transaction_id = pt.id;

-- 2.2 Vue complète des transactions avec informations utilisateur
CREATE OR REPLACE VIEW payment_transactions_view AS
SELECT 
  pt.*,
  p.name as user_name,
  p.phone as user_phone,
  p.role as user_role,
  CASE 
    WHEN pt.order_id IS NOT NULL THEN 'order'
    WHEN pt.product_id IS NOT NULL THEN 'product'
    ELSE 'general'
  END as transaction_context
FROM payment_transactions pt
LEFT JOIN profiles p ON pt.user_id = p.id;

-- 2.3 Vue complète de l'historique des commissions
CREATE OR REPLACE VIEW commission_history_view AS
SELECT 
  ch.*,
  buyer.name as buyer_name,
  buyer.phone as buyer_phone,
  seller.name as seller_name,
  seller.phone as seller_phone,
  o.total_amount as order_total,
  p.name as product_name,
  p.category as product_category
FROM commissions_history ch
LEFT JOIN profiles buyer ON ch.buyer_id = buyer.id
LEFT JOIN profiles seller ON ch.seller_id = seller.id
LEFT JOIN orders o ON ch.order_id = o.id
LEFT JOIN products p ON o.product_id = p.id;

-- ÉTAPE 3: MISE À JOUR DES POLITIQUES RLS POUR LES VUES

-- RLS pour wallets_view
CREATE POLICY "Admin can view all wallet details" 
ON wallets_view FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own wallet details" 
ON wallets_view FOR SELECT 
USING (auth.uid() = user_id);

-- RLS pour payment_transactions_view  
CREATE POLICY "Admin can view all transaction details" 
ON payment_transactions_view FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own transaction details" 
ON payment_transactions_view FOR SELECT 
USING (auth.uid() = user_id);

-- RLS pour commission_history_view
CREATE POLICY "Admin can view all commission details" 
ON commission_history_view FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own commission details" 
ON commission_history_view FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ÉTAPE 4: HARMONISATION DES CONTRAINTES ET INDEX

-- Index pour optimiser les performances des vues
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(type);
CREATE INDEX IF NOT EXISTS idx_commissions_history_buyer_seller ON commissions_history(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_commissions_history_order_id ON commissions_history(order_id);

-- ÉTAPE 5: SUPPRESSION DES ANCIENNES TABLES (après migration)
-- Attention: à exécuter seulement après vérification que les données ont bien été migrées

DROP TABLE IF EXISTS commission_history CASCADE;
DROP TABLE IF EXISTS payment_transaction CASCADE;
DROP TABLE IF EXISTS wallet CASCADE;

-- ÉTAPE 6: MISE À JOUR DES TRIGGERS EXISTANTS

-- S'assurer que les triggers pointent vers les bonnes tables
DROP TRIGGER IF EXISTS update_wallet_statistics ON payment_transaction;
CREATE TRIGGER update_wallet_statistics
  AFTER INSERT OR UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_wallet_statistics();

-- Log des modifications effectuées
CREATE TABLE IF NOT EXISTS migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL,
  table_name TEXT,
  description TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO migration_log (operation, table_name, description) VALUES
('CONSOLIDATE', 'commissions_history', 'Consolidated commission_history into commissions_history'),
('CONSOLIDATE', 'payment_transactions', 'Consolidated payment_transaction into payment_transactions'),
('CONSOLIDATE', 'wallets', 'Consolidated wallet into wallets'),
('CREATE_VIEW', 'wallets_view', 'Created comprehensive wallets view with user details'),
('CREATE_VIEW', 'payment_transactions_view', 'Created comprehensive transactions view'),
('CREATE_VIEW', 'commission_history_view', 'Created comprehensive commission history view'),
('DROP_TABLE', 'commission_history', 'Dropped duplicate commission_history table'),
('DROP_TABLE', 'payment_transaction', 'Dropped duplicate payment_transaction table'),
('DROP_TABLE', 'wallet', 'Dropped duplicate wallet table'),
('UPDATE_TRIGGERS', 'payment_transactions', 'Updated triggers to point to consolidated tables');
