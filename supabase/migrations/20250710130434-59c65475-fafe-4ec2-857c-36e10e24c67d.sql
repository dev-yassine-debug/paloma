
-- Ajouter une colonne ville aux profils des vendeurs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Créer une table pour les wallets si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer un wallet admin séparé
CREATE TABLE IF NOT EXISTS public.admin_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance NUMERIC DEFAULT 0.00,
  total_transactions INTEGER DEFAULT 0,
  total_commissions NUMERIC DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insérer un wallet admin par défaut s'il n'existe pas
INSERT INTO public.admin_wallet (balance, total_transactions, total_commissions)
SELECT 0.00, 0, 0.00
WHERE NOT EXISTS (SELECT 1 FROM public.admin_wallet);

-- Activer RLS sur les tables wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_wallet ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour wallets
CREATE POLICY "Users can view their own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow wallet creation during signup" ON public.wallets
  FOR INSERT WITH CHECK (true);

-- Politiques RLS pour admin wallet
CREATE POLICY "Admins can view admin wallet" ON public.admin_wallet
  FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update admin wallet" ON public.admin_wallet
  FOR UPDATE USING (get_current_user_role() = 'admin');

-- Fonction pour créer automatiquement un wallet lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un wallet
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Interdire la création de nouveaux comptes admin
CREATE OR REPLACE FUNCTION public.prevent_admin_signup()
RETURNS trigger AS $$
BEGIN
  -- Vérifier si on essaie de créer un profil admin
  IF NEW.role = 'admin' THEN
    -- Compter le nombre d'admins existants
    IF (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') > 0 THEN
      RAISE EXCEPTION 'La création de nouveaux comptes administrateur est interdite.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour empêcher la création de nouveaux admins
DROP TRIGGER IF EXISTS prevent_new_admin_signup ON public.profiles;
CREATE TRIGGER prevent_new_admin_signup
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_signup();
