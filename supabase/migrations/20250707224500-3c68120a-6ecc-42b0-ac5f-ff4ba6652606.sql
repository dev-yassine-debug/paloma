-- Supprimer le trigger qui cause des conflits
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer la fonction trigger
DROP FUNCTION IF EXISTS public.handle_new_user();