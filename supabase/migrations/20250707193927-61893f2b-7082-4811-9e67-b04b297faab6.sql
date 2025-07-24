-- Supprimer et recréer l'utilisateur admin 
DELETE FROM auth.users WHERE email = 'admin_Fahdfahd59@souqlocal.system';

-- Insérer l'utilisateur admin
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin_Fahdfahd59@souqlocal.system',
  crypt('Zazouzi12@3', gen_salt('bf', 8)),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Fahdfahd59", "role": "admin"}',
  'authenticated',
  'authenticated'
);