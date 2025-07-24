-- Créer des comptes de test directement dans auth.users
-- Vendeur de test
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  confirmed_at,
  phone_confirmed_at,
  encrypted_password,
  instance_id
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'vendeur_test@souqlocal.system',
  now(),
  '{"name": "Ahmed Vendeur", "role": "seller"}',
  '{"provider": "email", "providers": ["email"]}',
  now(),
  now(),
  now(),
  null,
  '$2a$10$ySaFQHfUf3WbcRLhbVBvV.5LOpS0/wbZGMlzUIJnGzojbO.lHK5wS', -- password: TestVendeur123
  '00000000-0000-0000-0000-000000000000'
);

-- Acheteur de test
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  confirmed_at,
  phone_confirmed_at,
  encrypted_password,
  instance_id
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'acheteur_test@souqlocal.system',
  now(),
  '{"name": "Sara Acheteuse", "role": "client"}',
  '{"provider": "email", "providers": ["email"]}',
  now(),
  now(),
  now(),
  null,
  '$2a$10$ySaFQHfUf3WbcRLhbVBvV.5LOpS0/wbZGMlzUIJnGzojbO.lHK5wS', -- password: TestAcheteur123
  '00000000-0000-0000-0000-000000000000'
);

-- Puis créer les profils
INSERT INTO public.profiles (id, name, phone, role) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Ahmed Vendeur', '+966501234567', 'seller'),
  ('22222222-2222-2222-2222-222222222222', 'Sara Acheteuse', '+966507654321', 'client');

-- Créer les wallets
INSERT INTO public.wallets (user_id, balance) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 500.00),
  ('22222222-2222-2222-2222-222222222222', 1000.00);