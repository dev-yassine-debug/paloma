
-- Étape 1: Vérification et correction de la structure de base de données

-- Mise à jour de la table profiles pour s'assurer qu'elle a tous les champs nécessaires
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
ADD COLUMN IF NOT EXISTS name text DEFAULT '',
ADD COLUMN IF NOT EXISTS city text DEFAULT '';

-- Mise à jour de la table wallets pour ajouter les champs manquants
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS total_sent NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_received NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_purchases NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_sales NUMERIC DEFAULT 0.00;

-- Correction de la table orders pour s'assurer qu'elle a tous les champs nécessaires
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS delivery_confirmation_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Étape 2: Insertion des données de test

-- 1. Création du profil admin (avec un ID fixe pour les tests)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin@souqlocal.com', crypt('admin123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, name, phone, role, city, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'المدير العام', '+966500000001', 'admin', 'الرياض', now(), now())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  city = EXCLUDED.city;

-- 2. Création du wallet admin avec solde initial
INSERT INTO wallets (user_id, balance, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 10000.00, now(), now())
ON CONFLICT (user_id) DO UPDATE SET balance = 10000.00;

-- 3. Création du profil vendeur
INSERT INTO auth.users (id, phone, phone_confirmed_at, created_at, updated_at)
VALUES ('22222222-2222-2222-2222-222222222222', '+966500000002', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, name, phone, role, city, created_at, updated_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'أحمد البائع', '+966500000002', 'seller', 'جدة', now(), now())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  city = EXCLUDED.city;

-- 4. Création du wallet vendeur
INSERT INTO wallets (user_id, balance, created_at, updated_at)
VALUES ('22222222-2222-2222-2222-222222222222', 0.00, now(), now())
ON CONFLICT (user_id) DO UPDATE SET balance = 0.00;

-- 5. Création du profil client
INSERT INTO auth.users (id, phone, phone_confirmed_at, created_at, updated_at)
VALUES ('33333333-3333-3333-3333-333333333333', '+966500000003', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, name, phone, role, city, created_at, updated_at)
VALUES ('33333333-3333-3333-3333-333333333333', 'فاطمة العميل', '+966500000003', 'client', 'الدمام', now(), now())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  city = EXCLUDED.city;

-- 6. Création du wallet client avec solde initial
INSERT INTO wallets (user_id, balance, created_at, updated_at)
VALUES ('33333333-3333-3333-3333-333333333333', 500.00, now(), now())
ON CONFLICT (user_id) DO UPDATE SET balance = 500.00;

-- 7. Création de 6 produits saoudiens
INSERT INTO products (id, name, description, price, category, seller_id, status, type, quantity, created_at)
VALUES 
('prod-1', 'تمر مجهول فاخر', 'تمر مجهول طبيعي من المدينة المنورة - كيلو واحد', 85.00, 'food', '22222222-2222-2222-2222-222222222222', 'pending', 'product', 50, now()),
('prod-2', 'قهوة عربية أصيلة', 'قهوة عربية محمصة تقليدياً من جبال عسير - 500 غرام', 65.00, 'food', '22222222-2222-2222-2222-222222222222', 'pending', 'product', 30, now()),
('prod-3', 'عود طبيعي كمبودي', 'عود كمبودي طبيعي عالي الجودة - 50 غرام', 450.00, 'perfume', '22222222-2222-2222-2222-222222222222', 'approved', 'product', 10, now()),
('prod-4', 'عسل سدر جبلي', 'عسل سدر طبيعي من جبال الطائف - كيلو واحد', 280.00, 'food', '22222222-2222-2222-2222-222222222222', 'approved', 'product', 25, now()),
('prod-5', 'تشكيلة توابل سعودية', 'مجموعة التوابل التقليدية السعودية - 10 قطع', 120.00, 'food', '22222222-2222-2222-2222-222222222222', 'approved', 'product', 40, now()),
('prod-6', 'خنجر فضي تراثي', 'خنجر تراثي مصنوع يدوياً بالفضة الخالصة', 1200.00, 'crafts', '22222222-2222-2222-2222-222222222222', 'approved', 'product', 5, now());

-- 8. Création de 4 services
INSERT INTO products (id, name, description, price, category, seller_id, status, type, duration_hours, available_days, start_time, end_time, created_at)
VALUES 
('serv-1', 'تنظيف المنازل الشامل', 'خدمة تنظيف شاملة للمنازل والشقق', 200.00, 'cleaning', '22222222-2222-2222-2222-222222222222', 'pending', 'service', 4, ARRAY['sunday','monday','tuesday','wednesday','thursday'], '08:00:00', '16:00:00', now()),
('serv-2', 'صيانة أجهزة كهربائية', 'صيانة وإصلاح الأجهزة الكهربائية المنزلية', 150.00, 'maintenance', '22222222-2222-2222-2222-222222222222', 'approved', 'service', 2, ARRAY['sunday','monday','wednesday','friday'], '09:00:00', '17:00:00', now()),
('serv-3', 'تدريس خصوصي - رياضيات', 'دروس خصوصية في الرياضيات لجميع المراحل', 100.00, 'education', '22222222-2222-2222-2222-222222222222', 'approved', 'service', 1, ARRAY['saturday','sunday','monday','tuesday','wednesday','thursday'], '16:00:00', '21:00:00', now()),
('serv-4', 'تصوير المناسبات', 'تصوير احترافي للمناسبات والأفراح', 800.00, 'photography', '22222222-2222-2222-2222-222222222222', 'approved', 'service', 6, ARRAY['friday','saturday'], '14:00:00', '23:00:00', now());

-- 9. Simulation d'un achat avec toutes les étapes
-- Créer une commande
INSERT INTO orders (id, buyer_id, seller_id, product_id, quantity, total_amount, commission, cashback, status, payment_method, payment_status, delivery_status, created_at)
VALUES ('order-test-1', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'prod-4', 1, 294.00, 14.00, 14.70, 'pending', 'wallet', 'pending', 'pending', now());

-- Débiter le wallet du client
UPDATE wallets SET balance = balance - 294.00 WHERE user_id = '33333333-3333-3333-3333-333333333333';

-- Enregistrer la transaction de débit client
INSERT INTO payment_transactions (id, user_id, amount, type, status, description_ar, description_en, order_id, product_id, to_user_id, commission_amount, cashback_amount, created_at)
VALUES ('trans-1', '33333333-3333-3333-3333-333333333333', -294.00, 'purchase', 'pending', 'شراء عسل سدر جبلي - في انتظار التأكيد', 'Purchase honey - pending confirmation', 'order-test-1', 'prod-4', '22222222-2222-2222-2222-222222222222', 14.00, 14.70, now());

-- Mettre les fonds en attente dans admin_wallet
INSERT INTO admin_wallet (balance, pending_funds, total_transactions, created_at, updated_at) 
VALUES (10000.00, 294.00, 1, now(), now())
ON CONFLICT (id) DO UPDATE SET 
  pending_funds = admin_wallet.pending_funds + 294.00,
  total_transactions = admin_wallet.total_transactions + 1,
  updated_at = now();

-- 10. Ajouter des notifications
INSERT INTO notifications (user_id, title, message, type, metadata, created_at)
VALUES 
('22222222-2222-2222-2222-222222222222', 'طلب جديد', 'لديك طلب جديد لشراء عسل سدر جبلي', 'order', '{"order_id": "order-test-1", "product_name": "عسل سدر جبلي"}', now()),
('33333333-3333-3333-3333-333333333333', 'تم الشراء بنجاح', 'تم خصم المبلغ من محفظتك في انتظار تأكيد الاستلام', 'purchase', '{"order_id": "order-test-1", "amount": 294.00}', now());

-- 11. Correction de la fonction admin_recharge
CREATE OR REPLACE FUNCTION handle_admin_recharge(
    target_user_id UUID,
    recharge_amount NUMERIC,
    admin_user_id UUID,
    description_text TEXT DEFAULT 'شحن رصيد من الإدارة'
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    admin_balance NUMERIC;
BEGIN
    -- التحقق من رصيد الإدارة
    SELECT balance INTO admin_balance FROM admin_wallet LIMIT 1;
    
    IF admin_balance IS NULL OR admin_balance < recharge_amount THEN
        RETURN json_build_object('success', false, 'error', 'رصيد الإدارة غير كافي');
    END IF;
    
    -- خصم من رصيد الإدارة
    UPDATE admin_wallet SET 
        balance = balance - recharge_amount,
        total_transactions = total_transactions + 1,
        updated_at = now();
    
    -- إضافة إلى رصيد المستخدم
    UPDATE wallets SET 
        balance = balance + recharge_amount,
        total_received = total_received + recharge_amount,
        updated_at = now()
    WHERE user_id = target_user_id;
    
    -- تسجيل المعاملة
    INSERT INTO payment_transactions (
        user_id, amount, type, status, description_ar, description_en, 
        from_user_id, metadata, created_at
    ) VALUES (
        target_user_id, recharge_amount, 'admin_recharge', 'completed',
        description_text, 'Admin wallet recharge',
        admin_user_id, 
        json_build_object('admin_action', true, 'recharge_type', 'admin'),
        now()
    );
    
    RETURN json_build_object('success', true, 'message', 'تم شحن الرصيد بنجاح');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Fonction pour confirmer la réception et finaliser la transaction
CREATE OR REPLACE FUNCTION confirm_order_delivery(order_uuid UUID, buyer_user_id UUID)
RETURNS JSON AS $$
DECLARE
    order_record RECORD;
    seller_amount NUMERIC;
    cashback_amount NUMERIC;
    admin_commission NUMERIC;
BEGIN
    -- الحصول على تفاصيل الطلب
    SELECT * INTO order_record FROM orders WHERE id = order_uuid AND buyer_id = buyer_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'الطلب غير موجود');
    END IF;
    
    IF order_record.status != 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'الطلب تم معالجته مسبقاً');
    END IF;
    
    -- حساب المبالغ
    seller_amount := order_record.total_amount - order_record.commission;
    cashback_amount := order_record.cashback;
    admin_commission := order_record.commission - cashback_amount;
    
    -- إضافة المبلغ لرصيد البائع
    UPDATE wallets SET 
        balance = balance + seller_amount,
        total_received = total_received + seller_amount,
        total_sales = total_sales + seller_amount
    WHERE user_id = order_record.seller_id;
    
    -- إضافة الكاشباك للمشتري
    UPDATE wallets SET 
        balance = balance + cashback_amount,
        total_received = total_received + cashback_amount,
        total_cashback = total_cashback + cashback_amount
    WHERE user_id = order_record.buyer_id;
    
    -- تحديث رصيد الإدارة
    UPDATE admin_wallet SET 
        balance = balance + admin_commission,
        pending_funds = pending_funds - order_record.total_amount,
        total_commissions = total_commissions + admin_commission,
        updated_at = now();
    
    -- تحديث حالة الطلب
    UPDATE orders SET 
        status = 'completed',
        payment_status = 'completed',
        delivery_status = 'delivered',
        delivery_confirmation_date = now(),
        updated_at = now()
    WHERE id = order_uuid;
    
    -- تسجيل معاملة البائع
    INSERT INTO payment_transactions (
        user_id, amount, type, status, description_ar, order_id, 
        from_user_id, created_at
    ) VALUES (
        order_record.seller_id, seller_amount, 'sale_confirmed', 'completed',
        'استلام مبلغ البيع بعد تأكيد العميل', order_uuid,
        order_record.buyer_id, now()
    );
    
    -- تسجيل معاملة الكاشباك
    INSERT INTO payment_transactions (
        user_id, amount, type, status, description_ar, order_id,
        created_at
    ) VALUES (
        order_record.buyer_id, cashback_amount, 'cashback', 'completed',
        'كاشباك على عملية الشراء', order_uuid, now()
    );
    
    RETURN json_build_object('success', true, 'message', 'تم تأكيد الاستلام وتحويل المبالغ');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Activation du Realtime pour les tables importantes
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE payment_transactions REPLICA IDENTITY FULL;
ALTER TABLE wallets REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE products REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE orders, payment_transactions, wallets, notifications, products, profiles;
