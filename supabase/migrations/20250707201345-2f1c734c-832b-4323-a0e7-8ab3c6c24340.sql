-- Créer des comptes de test pour vendeur et acheteur
-- D'abord insérer dans auth.users (cette partie sera gérée par l'interface d'authentification)
-- Puis créer les profils

-- Profil vendeur de test
INSERT INTO public.profiles (id, name, phone, role) 
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'Ahmed Vendeur', 
  '+966501234567', 
  'seller'
);

-- Profil acheteur de test  
INSERT INTO public.profiles (id, name, phone, role) 
VALUES (
  '22222222-2222-2222-2222-222222222222', 
  'Sara Acheteuse', 
  '+966507654321', 
  'client'
);

-- Créer les wallets pour les comptes de test
INSERT INTO public.wallets (user_id, balance) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 500.00),
  ('22222222-2222-2222-2222-222222222222', 1000.00);