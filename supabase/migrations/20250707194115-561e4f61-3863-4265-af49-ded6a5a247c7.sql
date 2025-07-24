-- Supprimer l'utilisateur existant
DELETE FROM auth.users WHERE email = 'admin_Fahdfahd59@souqlocal.system';

-- Utiliser la fonction auth.users pour créer l'utilisateur admin correctement
SELECT auth.signup(
  'admin_Fahdfahd59@souqlocal.system',
  'Zazouzi12@3',
  '{"name": "Fahdfahd59", "role": "admin"}'
);