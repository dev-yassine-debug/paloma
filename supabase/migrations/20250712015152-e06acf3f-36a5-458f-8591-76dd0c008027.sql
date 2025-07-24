
-- Ajouter une contrainte pour éviter qu'un vendeur achète son propre produit
CREATE OR REPLACE FUNCTION prevent_seller_buying_own_product()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM products 
        WHERE id = NEW.product_id 
        AND seller_id = NEW.buyer_id
    ) THEN
        RAISE EXCEPTION 'Un vendeur ne peut pas acheter son propre produit';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour empêcher l'achat de ses propres produits
DROP TRIGGER IF EXISTS prevent_self_purchase ON orders;
CREATE TRIGGER prevent_self_purchase
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION prevent_seller_buying_own_product();

-- Améliorer la fonction update_wallet_balance pour gérer les commissions
CREATE OR REPLACE FUNCTION update_wallet_balance(
    p_user_id UUID,
    p_amount NUMERIC,
    p_transaction_type TEXT,
    p_description_ar TEXT DEFAULT NULL,
    p_description_en TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_reference_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_wallet_id UUID;
    v_transaction_id UUID;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    -- Verrouiller et obtenir le wallet
    SELECT id, balance INTO v_wallet_id, v_current_balance
    FROM wallets 
    WHERE user_id = p_user_id 
    FOR UPDATE;
    
    -- Si le wallet n'existe pas, le créer
    IF v_wallet_id IS NULL THEN
        INSERT INTO wallets (user_id, balance)
        VALUES (p_user_id, 0)
        RETURNING id, balance INTO v_wallet_id, v_current_balance;
    END IF;
    
    -- Calculer le nouveau solde
    v_new_balance := v_current_balance + p_amount;
    
    -- Vérifier que le solde ne devient pas négatif
    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Solde insuffisant. Solde actuel: %, Montant demandé: %', v_current_balance, p_amount;
    END IF;
    
    -- Créer la transaction
    INSERT INTO payment_transactions (
        user_id, 
        amount, 
        type, 
        status, 
        description_ar, 
        description_en, 
        metadata,
        transaction_id
    ) VALUES (
        p_user_id, 
        p_amount, 
        p_transaction_type, 
        'completed', 
        p_description_ar, 
        p_description_en,
        p_metadata || jsonb_build_object(
            'previous_balance', v_current_balance,
            'new_balance', v_new_balance,
            'wallet_id', v_wallet_id
        ),
        p_reference_id
    ) RETURNING id INTO v_transaction_id;
    
    -- Mettre à jour le wallet
    UPDATE wallets 
    SET 
        balance = v_new_balance,
        last_transaction_id = v_transaction_id,
        version = version + 1,
        updated_at = now()
    WHERE id = v_wallet_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corriger les politiques RLS pour permettre la suppression des produits
DROP POLICY IF EXISTS "Combined delete policy for admins and sellers" ON products;
CREATE POLICY "Combined delete policy for admins and sellers" 
ON products FOR DELETE 
USING (
    get_current_user_role() = 'admin' OR 
    auth.uid() = seller_id
);

-- Politique pour permettre aux admins de supprimer les éléments du panier
DROP POLICY IF EXISTS "Admins can delete cart items" ON cart_items;
CREATE POLICY "Admins can delete cart items" 
ON cart_items FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Politique pour permettre aux admins de supprimer les favoris
DROP POLICY IF EXISTS "Admins can delete favorites" ON user_favorites;
CREATE POLICY "Admins can delete favorites" 
ON user_favorites FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Améliorer la table admin_wallet pour suivre les commissions
ALTER TABLE admin_wallet 
ADD COLUMN IF NOT EXISTS last_commission_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Fonction pour traiter les commissions admin
CREATE OR REPLACE FUNCTION process_admin_commission(
    p_order_id UUID,
    p_commission_amount NUMERIC
) RETURNS VOID AS $$
DECLARE
    v_admin_wallet_id UUID;
    v_current_balance NUMERIC;
BEGIN
    -- Obtenir ou créer le wallet admin
    SELECT id, balance INTO v_admin_wallet_id, v_current_balance
    FROM admin_wallet
    LIMIT 1;
    
    IF v_admin_wallet_id IS NULL THEN
        INSERT INTO admin_wallet (balance, total_commissions, total_transactions)
        VALUES (p_commission_amount, p_commission_amount, 1)
        RETURNING id INTO v_admin_wallet_id;
    ELSE
        UPDATE admin_wallet 
        SET 
            balance = balance + p_commission_amount,
            total_commissions = total_commissions + p_commission_amount,
            total_transactions = total_transactions + 1,
            last_commission_date = now(),
            updated_at = now()
        WHERE id = v_admin_wallet_id;
    END IF;
    
    -- Enregistrer la transaction de commission
    INSERT INTO payment_transactions (
        user_id, 
        amount, 
        type, 
        status, 
        description_ar, 
        description_en,
        metadata,
        transaction_id
    ) VALUES (
        (SELECT auth.uid()), -- Admin user
        p_commission_amount, 
        'admin_commission', 
        'completed', 
        'عمولة من الطلب رقم ' || p_order_id,
        'Commission from order ' || p_order_id,
        jsonb_build_object(
            'order_id', p_order_id,
            'commission_type', 'purchase'
        ),
        p_order_id::TEXT
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
