
-- Ajouter le type de produit/service
ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT NULL;

-- Mettre à jour la table orders pour les nouvelles colonnes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_price NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_time TIME DEFAULT NULL;

-- Créer la table pour l'historique des commissions
CREATE TABLE IF NOT EXISTS commissions_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  product_price NUMERIC NOT NULL DEFAULT 0,
  commission NUMERIC NOT NULL DEFAULT 0,
  cashback NUMERIC NOT NULL DEFAULT 0,
  admin_gain NUMERIC NOT NULL DEFAULT 0,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table settings pour configuration dynamique
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer les paramètres de base
INSERT INTO app_settings (key, value, description_ar, description_en) VALUES
('commission_rate', '5.0', 'نسبة العمولة المئوية', 'Commission percentage rate'),
('cashback_rate', '1.5', 'نسبة الكاش باك المئوية', 'Cashback percentage rate')
ON CONFLICT (key) DO NOTHING;

-- RLS policies pour commissions_history
ALTER TABLE commissions_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all commissions" ON commissions_history
  FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own commissions" ON commissions_history
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- RLS policies pour app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON app_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify settings" ON app_settings
  FOR ALL USING (get_current_user_role() = 'admin');

-- Fonction pour calculer les totaux avec commission et cashback
CREATE OR REPLACE FUNCTION calculate_order_with_commission(
  base_price NUMERIC,
  commission_rate NUMERIC DEFAULT 5.0,
  cashback_rate NUMERIC DEFAULT 1.5
) RETURNS TABLE(
  product_price NUMERIC,
  commission NUMERIC,
  total_price NUMERIC,
  cashback NUMERIC,
  admin_gain NUMERIC
) AS $$
BEGIN
  product_price := base_price;
  commission := ROUND(base_price * (commission_rate / 100), 2);
  total_price := base_price + commission;
  cashback := ROUND(total_price * (cashback_rate / 100), 2);
  admin_gain := commission - cashback;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE TRIGGER update_commissions_history_updated_at
  BEFORE UPDATE ON commissions_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
