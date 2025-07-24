
-- Vérifier et ajuster la structure de la table notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS sound text;

-- Mettre à jour les politiques RLS pour les notifications
DROP POLICY IF EXISTS "Admin can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Deny all access by default" ON public.notifications;

-- Politique pour permettre aux admins de gérer toutes les notifications
CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Politique pour permettre aux utilisateurs de voir leurs propres notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de marquer leurs notifications comme lues
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion de nouvelles notifications (système et admin)
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);
