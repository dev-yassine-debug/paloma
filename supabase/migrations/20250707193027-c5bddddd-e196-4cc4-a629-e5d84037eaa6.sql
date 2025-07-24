
-- Mettre à jour le mot de passe de l'utilisateur admin
UPDATE auth.users 
SET encrypted_password = crypt('Zazouzi12@3', gen_salt('bf'))
WHERE email = 'admin_Fahdfahd59@souqlocal.system';
