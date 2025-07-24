-- Nettoyer tous les OTP codes existants
DELETE FROM public.otp_codes;

-- Supprimer tous les profils de test (garder seulement l'admin)
DELETE FROM public.profiles WHERE role != 'admin';

-- Supprimer toutes les wallets associées aux profils supprimés
DELETE FROM public.wallets WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- Nettoyer les utilisateurs auth (garder seulement l'admin)
-- Note: Ceci sera fait via l'interface Supabase Auth