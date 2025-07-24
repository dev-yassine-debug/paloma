-- Supprimer l'utilisateur existant
DELETE FROM auth.users WHERE email = 'admin_Fahdfahd59@souqlocal.system';

-- Recréer l'utilisateur admin avec toutes les colonnes nécessaires
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin_Fahdfahd59@souqlocal.system',
  crypt('Zazouzi12@3', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Fahdfahd59", "role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);