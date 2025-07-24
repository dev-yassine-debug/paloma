-- Créer table pour les transactions de paiement
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('wallet_recharge', 'purchase', 'withdrawal', 'commission')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  provider TEXT CHECK (provider IN ('telr', 'wallet', 'cash', 'face_to_face')),
  transaction_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer table pour la localisation des vendeurs
CREATE TABLE public.seller_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer table pour les commissions système
CREATE TABLE public.commission_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  seller_withdrawal_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 2.50,
  cashback_percent DECIMAL(5,2) NOT NULL DEFAULT 1.50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer les paramètres de commission par défaut
INSERT INTO public.commission_settings (customer_commission_percent, seller_withdrawal_fee_percent, cashback_percent)
VALUES (5.00, 2.50, 1.50);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour payment_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.payment_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- RLS Policies pour seller_locations
CREATE POLICY "Sellers can manage their own location" 
ON public.seller_locations 
FOR ALL 
USING (auth.uid() = seller_id);

CREATE POLICY "Everyone can view active seller locations" 
ON public.seller_locations 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can view all locations" 
ON public.seller_locations 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- RLS Policies pour commission_settings
CREATE POLICY "Admins can manage commission settings" 
ON public.commission_settings 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Everyone can read commission settings" 
ON public.commission_settings 
FOR SELECT 
USING (true);

-- Ajouter colonnes manquantes à la table orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS commission DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cashback DECIMAL(10,2) DEFAULT 0;

-- Créer fonction pour calculer les prix avec commission
CREATE OR REPLACE FUNCTION public.calculate_order_totals(
  product_price DECIMAL(10,2),
  quantity INTEGER,
  payment_method TEXT DEFAULT 'wallet'
)
RETURNS TABLE(
  subtotal DECIMAL(10,2),
  commission DECIMAL(10,2),
  cashback DECIMAL(10,2),
  total_amount DECIMAL(10,2)
) AS $$
DECLARE
  settings RECORD;
BEGIN
  -- Récupérer les paramètres de commission
  SELECT * INTO settings FROM public.commission_settings ORDER BY created_at DESC LIMIT 1;
  
  -- Calculer les montants
  subtotal := product_price * quantity;
  commission := subtotal * (settings.customer_commission_percent / 100);
  total_amount := subtotal + commission;
  
  -- Calculer le cashback uniquement pour les paiements par wallet
  IF payment_method = 'wallet' THEN
    cashback := subtotal * (settings.cashback_percent / 100);
  ELSE
    cashback := 0;
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Créer fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer triggers pour updated_at
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_locations_updated_at
  BEFORE UPDATE ON public.seller_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commission_settings_updated_at
  BEFORE UPDATE ON public.commission_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();