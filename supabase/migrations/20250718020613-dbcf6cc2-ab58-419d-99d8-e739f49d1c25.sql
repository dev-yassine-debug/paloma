
-- Amélioration des catégories avec support hiérarchique et traductions complètes
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS service_fields JSONB DEFAULT '{}';

-- Table pour les zones de service
CREATE TABLE IF NOT EXISTS service_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  district TEXT,
  radius_km NUMERIC DEFAULT 10,
  travel_fee NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour l'audit de sécurité
CREATE TABLE IF NOT EXISTS security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour la modération avancée
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL, -- 'product', 'service', 'profile'
  item_id UUID NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  assigned_to UUID REFERENCES profiles(id),
  priority INTEGER DEFAULT 0,
  notes TEXT,
  auto_flags JSONB DEFAULT '{}',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les sessions et tokens
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP or user_id
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(identifier, endpoint)
);

-- Table pour conformité PDPL
CREATE TABLE IF NOT EXISTS data_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'data_processing', 'marketing', 'cookies'
  granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Amélioration des politiques RLS existantes
DROP POLICY IF EXISTS "Service role can manage all" ON service_zones;
CREATE POLICY "Sellers can manage their service zones" ON service_zones
FOR ALL USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Admins can view service zones" ON service_zones;
CREATE POLICY "Admins can view all service zones" ON service_zones
FOR SELECT USING (get_current_user_role() = 'admin');

-- RLS pour audit de sécurité
ALTER TABLE security_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view security audit" ON security_audit
FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert audit logs" ON security_audit
FOR INSERT WITH CHECK (true);

-- RLS pour modération
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage moderation queue" ON moderation_queue
FOR ALL USING (get_current_user_role() = 'admin');

-- RLS pour sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions" ON user_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" ON user_sessions
FOR ALL USING (true);

-- RLS pour rate limiting
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can manage rate limits" ON rate_limits
FOR ALL USING (true);

-- RLS pour consentement PDPL
ALTER TABLE data_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own consent" ON data_consent
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent" ON data_consent
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all consent records" ON data_consent
FOR SELECT USING (get_current_user_role() = 'admin');

-- Fonction pour audit automatique
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'info'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO security_audit (
    user_id, action, resource_type, resource_id, 
    ip_address, details, severity
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    inet_client_addr(), p_details, p_severity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier le rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT requests_count INTO v_count
  FROM rate_limits
  WHERE identifier = p_identifier 
    AND endpoint = p_endpoint
    AND window_start > v_window_start;
  
  IF v_count IS NULL THEN
    INSERT INTO rate_limits (identifier, endpoint, requests_count)
    VALUES (p_identifier, p_endpoint, 1)
    ON CONFLICT (identifier, endpoint) 
    DO UPDATE SET 
      requests_count = 1,
      window_start = now();
    RETURN true;
  ELSIF v_count < p_limit THEN
    UPDATE rate_limits 
    SET requests_count = requests_count + 1
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
    RETURN true;
  ELSE
    UPDATE rate_limits 
    SET blocked_until = now() + '1 hour'::INTERVAL
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Amélioration de la validation des produits
CREATE OR REPLACE FUNCTION validate_product_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validation du prix
  IF NEW.price <= 0 THEN
    RAISE EXCEPTION 'Le prix doit être supérieur à zéro';
  END IF;
  
  -- Validation des champs requis
  IF LENGTH(TRIM(NEW.name)) < 3 THEN
    RAISE EXCEPTION 'Le nom du produit doit contenir au moins 3 caractères';
  END IF;
  
  -- Validation de la catégorie
  IF NEW.category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM product_categories 
    WHERE id = NEW.category_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Catégorie invalide ou inactive';
  END IF;
  
  -- Validation pour les services
  IF NEW.type = 'service' THEN
    IF NEW.duration_hours IS NULL OR NEW.duration_hours <= 0 THEN
      RAISE EXCEPTION 'La durée du service doit être spécifiée';
    END IF;
  END IF;
  
  -- Log de l'audit
  PERFORM log_security_event(
    NEW.seller_id,
    'product_validation',
    'product',
    NEW.id::TEXT,
    jsonb_build_object('product_name', NEW.name, 'type', NEW.type)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour validation des produits
DROP TRIGGER IF EXISTS validate_product_trigger ON products;
CREATE TRIGGER validate_product_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION validate_product_data();

-- Index pour optimisation des performances
CREATE INDEX IF NOT EXISTS idx_products_seller_status ON products(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_products_category_type ON products(category_id, type);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_created ON orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON payment_transactions(user_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_action ON security_audit(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_status_priority ON moderation_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint ON rate_limits(identifier, endpoint);

-- Insertion des catégories de base avec traductions complètes
INSERT INTO product_categories (name_ar, name_en, slug, icon, description_ar, description_en, is_active, priority) VALUES
('إلكترونيات', 'Electronics', 'electronics', '📱', 'أجهزة إلكترونية وتقنية', 'Electronic devices and technology', true, 1),
('ملابس وأزياء', 'Fashion & Clothing', 'fashion', '👕', 'ملابس وإكسسوارات', 'Clothing and accessories', true, 2),
('منزل وحديقة', 'Home & Garden', 'home-garden', '🏠', 'أثاث ومستلزمات منزلية', 'Furniture and home essentials', true, 3),
('خدمات منزلية', 'Home Services', 'home-services', '🔧', 'خدمات التنظيف والصيانة', 'Cleaning and maintenance services', true, 4),
('توصيل ونقل', 'Delivery & Transport', 'delivery', '🚚', 'خدمات التوصيل والنقل', 'Delivery and transport services', true, 5),
('تعليم ودروس', 'Education & Tutoring', 'education', '📚', 'دروس خصوصية وتعليم', 'Private lessons and education', true, 6)
ON CONFLICT (slug) DO NOTHING;
