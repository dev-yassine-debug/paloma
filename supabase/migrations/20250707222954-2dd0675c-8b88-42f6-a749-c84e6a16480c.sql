-- Vérifier et recréer l'enum app_role si nécessaire
DO $$ 
BEGIN
    -- Vérifier si l'enum existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        -- Créer l'enum s'il n'existe pas
        CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'client');
    END IF;
END $$;

-- S'assurer que la colonne role utilise bien l'enum
ALTER TABLE public.profiles ALTER COLUMN role TYPE public.app_role USING role::public.app_role;