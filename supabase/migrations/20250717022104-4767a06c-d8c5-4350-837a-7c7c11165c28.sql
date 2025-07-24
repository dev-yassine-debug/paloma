
-- Créer la table des catégories de produits
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  parent_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer les catégories principales selon AVOIR.md
INSERT INTO public.product_categories (name_ar, name_en, slug, icon, priority, is_popular) VALUES
-- Alimentation & Boissons
('الأطعمة والمشروبات', 'Food & Beverages', 'food-beverages', 'utensils', 1, true),
('فواكه', 'Fruits', 'fruits', 'apple', 2, true),
('خضروات', 'Vegetables', 'vegetables', 'carrot', 3, true),
('أجبان', 'Cheese', 'cheese', 'cheese', 4, false),
('لحوم', 'Meat', 'meat', 'beef', 5, true),
('أسماك', 'Fish', 'fish', 'fish', 6, false),
('خبز ومخبوزات', 'Bread & Bakery', 'bread-bakery', 'bread-slice', 7, false),
('منتجات الألبان', 'Dairy Products', 'dairy', 'milk', 8, false),
('توابل ومكسرات', 'Spices & Nuts', 'spices-nuts', 'pepper-hot', 9, false),
('مشروبات', 'Beverages', 'beverages', 'coffee', 10, false),
('منتجات مجمدة', 'Frozen Products', 'frozen', 'snowflake', 11, false),
('أغذية صحية', 'Healthy Foods', 'healthy-foods', 'leaf', 12, true),

-- Produits ménagers
('منتجات التنظيف والمنزل', 'Cleaning & Home Products', 'cleaning-home', 'spray-can', 13, false),
('منظفات منزلية', 'Home Cleaners', 'home-cleaners', 'spray-can', 14, false),
('معطرات جو', 'Air Fresheners', 'air-fresheners', 'wind', 15, false),
('أدوات تنظيف', 'Cleaning Tools', 'cleaning-tools', 'broom', 16, false),
('ورق منزلي', 'Paper Products', 'paper-products', 'file-text', 17, false),

-- Beauté & Soins
('العناية الشخصية والجمال', 'Beauty & Personal Care', 'beauty-care', 'heart', 18, true),
('مستحضرات تجميل', 'Cosmetics', 'cosmetics', 'palette', 19, true),
('عطور', 'Perfumes', 'perfumes', 'flower', 20, true),
('منتجات العناية بالبشرة', 'Skincare', 'skincare', 'droplet', 21, false),
('منتجات العناية بالشعر', 'Hair Care', 'hair-care', 'scissors', 22, false),
('أدوات تجميل', 'Beauty Tools', 'beauty-tools', 'mirror', 23, false),
('مستلزمات الحمام', 'Bath Essentials', 'bath-essentials', 'bath', 24, false),

-- Vêtements & Accessoires
('الملابس والإكسسوارات', 'Clothing & Accessories', 'clothing-accessories', 'shirt', 25, true),
('ملابس رجالية', 'Men Clothing', 'men-clothing', 'shirt', 26, false),
('ملابس نسائية', 'Women Clothing', 'women-clothing', 'dress', 27, true),
('ملابس أطفال', 'Kids Clothing', 'kids-clothing', 'baby', 28, false),
('أحذية', 'Shoes', 'shoes', 'shoe', 29, true),
('حقائب ومحافظ', 'Bags & Wallets', 'bags-wallets', 'briefcase', 30, false),
('ساعات ونظارات', 'Watches & Glasses', 'watches-glasses', 'watch', 31, false),

-- Mobilier & Décoration
('الأثاث والديكور', 'Furniture & Decoration', 'furniture-decoration', 'sofa', 32, false),
('أثاث منزلي', 'Home Furniture', 'home-furniture', 'armchair', 33, false),
('ديكورات جدارية', 'Wall Decorations', 'wall-decorations', 'frame', 34, false),
('إضاءة', 'Lighting', 'lighting', 'lightbulb', 35, false),
('مفروشات', 'Furnishings', 'furnishings', 'bed', 36, false),
('أدوات المطبخ', 'Kitchen Tools', 'kitchen-tools', 'chef-hat', 37, false),

-- Bébés & Enfants
('الأطفال والمواليد', 'Babies & Children', 'babies-children', 'baby', 38, true),
('ألعاب أطفال', 'Children Toys', 'children-toys', 'toy-brick', 39, true),
('مستلزمات الرضع', 'Baby Essentials', 'baby-essentials', 'milk', 40, false),
('عربات ومقاعد سيارات', 'Strollers & Car Seats', 'strollers-car-seats', 'car', 41, false),

-- Électronique & Tech
('الإلكترونيات والتقنية', 'Electronics & Technology', 'electronics-tech', 'smartphone', 42, true),
('هواتف ذكية', 'Smartphones', 'smartphones', 'smartphone', 43, true),
('أجهزة لوحية', 'Tablets', 'tablets', 'tablet', 44, false),
('شواحن وكابلات', 'Chargers & Cables', 'chargers-cables', 'cable', 45, false),
('سماعات وملحقات', 'Headphones & Accessories', 'headphones-accessories', 'headphones', 46, false),
('حواسيب وأجهزة مكتبية', 'Computers & Office', 'computers-office', 'monitor', 47, false),
('أجهزة منزلية ذكية', 'Smart Home Devices', 'smart-home', 'home', 48, false),

-- Voitures & Services
('السيارات والخدمات', 'Cars & Services', 'cars-services', 'car', 49, false),
('قطع غيار السيارات', 'Car Parts', 'car-parts', 'wrench', 50, false),
('إكسسوارات السيارات', 'Car Accessories', 'car-accessories', 'car', 51, false),
('غسيل سيارات', 'Car Wash', 'car-wash', 'droplets', 52, false),
('خدمات صيانة وإصلاح', 'Maintenance & Repair Services', 'maintenance-repair', 'hammer', 53, false),

-- Livres & Hobbies
('الكتب والهوايات', 'Books & Hobbies', 'books-hobbies', 'book', 54, false),
('كتب', 'Books', 'books', 'book-open', 55, false),
('روايات وقصص', 'Novels & Stories', 'novels-stories', 'book-heart', 56, false),
('مستلزمات الرسم والفنون', 'Art & Drawing Supplies', 'art-drawing', 'palette', 57, false),
('أدوات موسيقية', 'Musical Instruments', 'musical-instruments', 'music', 58, false),

-- Services professionnels & numériques
('الخدمات المهنية والرقمية', 'Professional & Digital Services', 'professional-digital', 'briefcase', 59, true),
('تطوير مواقع إلكترونية', 'Web Development', 'web-development', 'code', 60, true),
('تصميم جرافيك', 'Graphic Design', 'graphic-design', 'palette', 61, true),
('تسويق رقمي', 'Digital Marketing', 'digital-marketing', 'megaphone', 62, false),
('تصوير ومونتاج', 'Photography & Video Editing', 'photography-video', 'camera', 63, false),
('كتابة وترجمة', 'Writing & Translation', 'writing-translation', 'pen', 64, false),
('استشارات أعمال', 'Business Consulting', 'business-consulting', 'briefcase-business', 65, false),
('خدمة العملاء والدعم', 'Customer Service & Support', 'customer-support', 'headset', 66, false),

-- Voyages & Loisirs
('السفر والرحلات', 'Travel & Tourism', 'travel-tourism', 'plane', 67, false),
('حجوزات فنادق', 'Hotel Bookings', 'hotel-bookings', 'building', 68, false),
('تنظيم رحلات', 'Trip Organization', 'trip-organization', 'map', 69, false),
('نشاطات ترفيهية', 'Entertainment Activities', 'entertainment', 'gamepad-2', 70, false),

-- Santé & Bien-être
('الصحة والعلاج', 'Health & Treatment', 'health-treatment', 'heart-pulse', 71, false),
('مكملات غذائية', 'Dietary Supplements', 'supplements', 'pill', 72, false),
('معدات طبية', 'Medical Equipment', 'medical-equipment', 'stethoscope', 73, false),
('استشارات طبية عن بعد', 'Remote Medical Consultations', 'remote-medical', 'user-doctor', 74, false),

-- Articles religieux
('مستلزمات دينية', 'Religious Items', 'religious-items', 'book-heart', 75, false),
('مصاحف', 'Quran', 'quran', 'book-open', 76, false),
('سجاد صلاة', 'Prayer Rugs', 'prayer-rugs', 'square', 77, false),
('مسابح', 'Prayer Beads', 'prayer-beads', 'circle', 78, false);

-- Mettre à jour la table products pour ajouter category_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
        ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Migrer les catégories existantes vers les nouvelles IDs
UPDATE public.products 
SET category_id = (
  SELECT id FROM public.product_categories 
  WHERE name_ar = products.category OR slug = LOWER(REPLACE(products.category, ' ', '-'))
  LIMIT 1
)
WHERE category IS NOT NULL;

-- Activer RLS sur product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Politique pour voir les catégories actives
CREATE POLICY "Public can view active categories" 
ON public.product_categories 
FOR SELECT 
USING (is_active = true);

-- Politique pour les admins
CREATE POLICY "Admins can manage categories" 
ON public.product_categories 
FOR ALL 
USING (get_current_user_role() = 'admin') 
WITH CHECK (get_current_user_role() = 'admin');

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_product_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_categories_updated_at_trigger
    BEFORE UPDATE ON public.product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_product_categories_updated_at();
