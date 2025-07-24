
-- Améliorer les politiques RLS pour la gestion des produits

-- Supprimer les anciennes politiques de suppression
DROP POLICY IF EXISTS "Combined delete policy for admins and sellers" ON public.products;

-- Créer une nouvelle politique pour permettre aux admins de supprimer tous les produits
CREATE POLICY "Admins can delete all products" 
ON public.products 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Créer une politique pour permettre aux vendeurs de supprimer leurs propres produits
CREATE POLICY "Sellers can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = seller_id AND get_current_user_role() = 'seller');

-- Améliorer les politiques pour les tables liées pour éviter les erreurs de suppression

-- Politique pour cart_items (permettre la suppression en cascade)
DROP POLICY IF EXISTS "Admins can delete cart items" ON public.cart_items;
CREATE POLICY "System can delete cart items for product deletion" 
ON public.cart_items 
FOR DELETE 
USING (true);

-- Politique pour user_favorites (permettre la suppression en cascade)
DROP POLICY IF EXISTS "Admins can delete favorites" ON public.user_favorites;
CREATE POLICY "System can delete favorites for product deletion" 
ON public.user_favorites 
FOR DELETE 
USING (true);

-- Politique pour product_reviews (permettre la suppression en cascade)
CREATE POLICY "System can delete reviews for product deletion" 
ON public.product_reviews 
FOR DELETE 
USING (true);

-- Politique pour orders (permettre la suppression en cascade)
CREATE POLICY "System can delete orders for product deletion" 
ON public.orders 
FOR DELETE 
USING (true);

-- Politique pour product_updates (permettre la suppression en cascade)
CREATE POLICY "System can delete product updates for product deletion" 
ON public.product_updates 
FOR DELETE 
USING (true);

-- S'assurer que les admins peuvent voir tous les profils pour la gestion des utilisateurs
DROP POLICY IF EXISTS "View profiles" ON public.profiles;
CREATE POLICY "View profiles" 
ON public.profiles 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR 
  auth.uid() = id OR 
  get_current_user_role() IN ('seller', 'client')
);
