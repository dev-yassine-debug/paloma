-- Corriger le problème de récursion infinie dans les politiques RLS
-- 1. Supprimer les politiques actuelles qui causent le problème
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Créer une fonction de sécurité pour vérifier le rôle admin
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
LANGUAGE SQL
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Recréer la politique admin en utilisant la fonction de sécurité
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- 4. Créer une politique pour permettre aux admins de mettre à jour tous les profils
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_current_user_role() = 'admin');