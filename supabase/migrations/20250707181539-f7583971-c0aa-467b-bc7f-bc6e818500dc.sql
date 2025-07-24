
-- Créer l'utilisateur admin avec email spécial et mot de passe
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
  crypt('Zazouzi123@', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Fahdfahd59", "role": "admin"}',
  false,
  'authenticated'
);

-- Le profil sera créé automatiquement par le trigger handle_new_user()
