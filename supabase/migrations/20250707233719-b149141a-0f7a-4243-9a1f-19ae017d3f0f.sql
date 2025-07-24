-- Créer un bucket de stockage pour les images de produits
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Créer les politiques pour le bucket product-images
CREATE POLICY "Sellers can upload their own product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Everyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Sellers can update their own product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Sellers can delete their own product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Ajouter colonne pour video_url dans la table products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Créer table pour les modifications de produits en attente
CREATE TABLE public.product_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  quantity INTEGER,
  category TEXT,
  image_url TEXT,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS pour product_updates
ALTER TABLE public.product_updates ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour product_updates
CREATE POLICY "Sellers can create update requests for their products" 
ON public.product_updates 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can view their update requests" 
ON public.product_updates 
FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all update requests" 
ON public.product_updates 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can approve/reject update requests" 
ON public.product_updates 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

-- Trigger pour updated_at sur product_updates
CREATE TRIGGER update_product_updates_updated_at
  BEFORE UPDATE ON public.product_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();