
-- Ajouter les champs manquants pour les services dans la table products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS available_days TEXT[], 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Mettre à jour les champs existants pour avoir des valeurs par défaut cohérentes
UPDATE public.products 
SET available_days = ARRAY['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
WHERE type = 'service' AND available_days IS NULL;

UPDATE public.products 
SET start_time = '08:00:00', end_time = '18:00:00'
WHERE type = 'service' AND (start_time IS NULL OR end_time IS NULL);
