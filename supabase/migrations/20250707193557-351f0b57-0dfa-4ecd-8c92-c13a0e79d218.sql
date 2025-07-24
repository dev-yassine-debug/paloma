-- Supprimer l'ancien utilisateur admin et le recréer avec le bon mot de passe
DELETE FROM auth.users WHERE email = 'admin_Fahdfahd59@souqlocal.system';

-- Créer l'utilisateur admin avec le nouveau mot de passe
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin_Fahdfahd59@souqlocal.system',
  crypt('Zazouzi12@3', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Fahdfahd59", "role": "admin"}',
  false,
  'authenticated'
);