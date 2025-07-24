-- Tester le mot de passe actuel
SELECT 
  email,
  encrypted_password,
  crypt('Zazouzi12@3', encrypted_password) = encrypted_password AS password_match
FROM auth.users 
WHERE email = 'admin_Fahdfahd59@souqlocal.system';