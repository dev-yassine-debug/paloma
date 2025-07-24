
-- Corriger la fonction process-purchase pour ne pas donner le cashback immédiatement
-- Le cashback ne doit être donné qu'après confirmation de réception

-- Supprimer l'ancienne fonction et la recréer
DROP FUNCTION IF EXISTS public.process_purchase_payment(uuid, uuid, uuid, uuid, integer, numeric, text);

-- Créer une fonction pour traiter le paiement sans cashback immédiat
CREATE OR REPLACE FUNCTION public.process_purchase_payment(
    p_order_id uuid,
    p_buyer_id uuid,
    p_seller_id uuid,
    p_product_id uuid,
    p_quantity integer,
    p_product_price numeric,
    p_payment_method text DEFAULT 'wallet'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_settings record;
    v_subtotal numeric;
    v_commission numeric;
    v_total_amount numeric;
    v_cashback numeric;
BEGIN
    -- Récupérer les paramètres de commission
    SELECT * INTO v_settings FROM commission_settings ORDER BY created_at DESC LIMIT 1;
    
    -- Calculer les montants
    v_subtotal := p_product_price * p_quantity;
    v_commission := v_subtotal * (v_settings.customer_commission_percent / 100);
    v_total_amount := v_subtotal + v_commission;
    
    -- Calculer le cashback mais ne pas le donner maintenant
    IF p_payment_method = 'wallet' THEN
        v_cashback := v_total_amount * (v_settings.cashback_percent / 100);
    ELSE
        v_cashback := 0;
    END IF;
    
    -- Débiter le wallet de l'acheteur
    PERFORM update_wallet_balance(
        p_buyer_id,
        -v_total_amount,
        'purchase',
        'شراء منتج - الطلب ' || p_order_id,
        'Product purchase - Order ' || p_order_id,
        jsonb_build_object(
            'order_id', p_order_id,
            'product_id', p_product_id,
            'commission_amount', v_commission,
            'cashback_pending', v_cashback
        ),
        p_order_id::text
    );
    
    -- Mettre à jour le wallet admin avec la commission
    INSERT INTO admin_wallet (balance, total_commissions, total_transactions, updated_at)
    VALUES (v_commission, v_commission, 1, now())
    ON CONFLICT (id) DO UPDATE SET
        balance = admin_wallet.balance + v_commission,
        total_commissions = admin_wallet.total_commissions + v_commission,
        total_transactions = admin_wallet.total_transactions + 1,
        updated_at = now();
    
    -- Enregistrer l'historique des commissions (sans cashback pour l'instant)
    INSERT INTO commissions_history (
        order_id,
        buyer_id,
        seller_id,
        product_price,
        commission,
        cashback,
        admin_gain,
        total_paid
    ) VALUES (
        p_order_id,
        p_buyer_id,
        p_seller_id,
        v_subtotal,
        v_commission,
        0, -- Cashback sera donné plus tard
        v_commission,
        v_total_amount
    );
    
    -- Créer l'enregistrement cashback en attente
    INSERT INTO cashback_history (
        user_id,
        order_id,
        amount,
        status,
        metadata
    ) VALUES (
        p_buyer_id,
        p_order_id,
        v_cashback,
        'pending',
        jsonb_build_object('cashback_rate', v_settings.cashback_percent)
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'commission', v_commission,
        'cashback_pending', v_cashback,
        'total_amount', v_total_amount,
        'message', 'Payment processed, cashback pending confirmation'
    );
END;
$$;

-- Corriger la fonction de confirmation de commande pour donner le cashback
CREATE OR REPLACE FUNCTION public.confirm_order_delivery(
    p_order_id uuid,
    p_buyer_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    v_order record;
    v_cashback_record record;
    v_admin_wallet record;
BEGIN
    -- Vérifier que la commande existe et appartient à l'acheteur
    SELECT * INTO v_order FROM orders 
    WHERE id = p_order_id AND buyer_id = p_buyer_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found or access denied');
    END IF;
    
    -- Vérifier que la commande est en statut 'delivered'
    IF v_order.status != 'delivered' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order must be delivered first');
    END IF;
    
    -- Récupérer le cashback en attente
    SELECT * INTO v_cashback_record FROM cashback_history 
    WHERE order_id = p_order_id AND user_id = p_buyer_id AND status = 'pending';
    
    -- Transférer l'argent au vendeur (prix original sans commission)
    PERFORM update_wallet_balance(
        v_order.seller_id,
        v_order.product_price * v_order.quantity,
        'sale_confirmed',
        'بيع مؤكد - الطلب ' || p_order_id,
        'Confirmed sale - Order ' || p_order_id,
        jsonb_build_object(
            'order_id', p_order_id,
            'confirmed_by', 'buyer',
            'commission_deducted', v_order.commission
        ),
        p_order_id::text
    );
    
    -- Donner le cashback à l'acheteur MAINTENANT
    IF v_cashback_record.amount > 0 THEN
        -- Vérifier que l'admin a suffisamment de fonds
        SELECT * INTO v_admin_wallet FROM admin_wallet LIMIT 1;
        
        IF v_admin_wallet.balance >= v_cashback_record.amount THEN
            -- Débiter l'admin wallet
            UPDATE admin_wallet 
            SET 
                balance = balance - v_cashback_record.amount,
                total_cashbacks_paid = total_cashbacks_paid + v_cashback_record.amount,
                updated_at = now();
            
            -- Créditer le cashback à l'acheteur
            PERFORM update_wallet_balance(
                p_buyer_id,
                v_cashback_record.amount,
                'cashback',
                'كاش باك للطلب ' || p_order_id,
                'Cashback for order ' || p_order_id,
                jsonb_build_object(
                    'order_id', p_order_id,
                    'cashback_rate', v_cashback_record.metadata->>'cashback_rate'
                ),
                p_order_id::text
            );
            
            -- Marquer le cashback comme traité
            UPDATE cashback_history 
            SET 
                status = 'completed',
                processed_at = now()
            WHERE id = v_cashback_record.id;
            
            -- Mettre à jour l'historique des commissions
            UPDATE commissions_history 
            SET 
                cashback = v_cashback_record.amount,
                admin_gain = commission - v_cashback_record.amount
            WHERE order_id = p_order_id;
        END IF;
    END IF;
    
    -- Mettre à jour le statut de la commande
    UPDATE orders 
    SET 
        status = 'completed',
        updated_at = now()
    WHERE id = p_order_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'seller_payment', v_order.product_price * v_order.quantity,
        'buyer_cashback', COALESCE(v_cashback_record.amount, 0),
        'message', 'Order confirmed and payments processed'
    );
END;
$$;

-- Supprimer l'ancien trigger qui pourrait causer des doublons
DROP TRIGGER IF EXISTS update_commissions_history_trigger ON payment_transactions;
DROP FUNCTION IF EXISTS public.update_commissions_history();
