-- Corriger les politiques pour les produits aussi
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can update all products" ON public.products;

-- Recréer les politiques pour les produits en utilisant la fonction de sécurité
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all products" ON public.products
  FOR UPDATE USING (public.get_current_user_role() = 'admin');