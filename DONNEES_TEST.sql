
-- Données de test pour le vendeur spécifique
-- seller_id = f8f08773-14c4-427f-b88f-eeecddcc8625

-- Insérer des catégories si elles n'existent pas
INSERT INTO public.product_categories (id, name_ar, name_en, slug, icon, is_active, priority) VALUES
('cat1', 'إلكترونيات', 'Electronics', 'electronics', '📱', true, 1),
('cat2', 'ملابس', 'Clothing', 'clothing', '👕', true, 2),
('cat3', 'خدمات منزلية', 'Home Services', 'home-services', '🔧', true, 3),
('cat4', 'طعام ومشروبات', 'Food & Beverages', 'food-beverages', '🍕', true, 4),
('cat5', 'خدمات التنظيف', 'Cleaning Services', 'cleaning-services', '🧹', true, 5)
ON CONFLICT (id) DO NOTHING;

-- Insérer des produits de test
INSERT INTO public.products (
  id, name, description, price, quantity, image_url, image_urls, video_url,
  category_id, type, seller_id, status, is_popular, is_new, is_featured,
  latitude, longitude, created_at
) VALUES
(
  gen_random_uuid(),
  'جهاز iPhone 15 Pro Max',
  'أحدث إصدار من آيفون مع كاميرا متطورة وأداء عالي. ذاكرة 256 جيجا، لون تيتانيوم طبيعي. حالة ممتازة مع جميع الملحقات الأصلية.',
  4500.00,
  5,
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
  ARRAY[
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'
  ],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'cat1',
  'product',
  'f8f08773-14c4-427f-b88f-eeecddcc8625',
  'approved',
  true,
  true,
  false,
  24.7136,
  46.6753,
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'لابتوب MacBook Air M2',
  'لابتوب MacBook Air بمعالج M2، 13 بوصة، ذاكرة 8GB، تخزين 256GB SSD. مثالي للطلاب والمحترفين. حالة جديدة بالكرتون.',
  3800.00,
  3,
  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
  ARRAY[
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
  ],
  null,
  'cat1',
  'product',
  'f8f08773-14c4-427f-b88f-eeecddcc8625',
  'approved',
  true,
  false,
  true,
  24.7136,
  46.6753,
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  'ثوب رجالي فاخر',
  'ثوب رجالي عالي الجودة من القطن الخالص، تصميم عصري أنيق، متوفر بألوان مختلفة. مناسب للمناسبات الرسمية والعملية.',
  180.00,
  15,
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
  ARRAY[
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=500'
  ],
  null,
  'cat2',
  'product',
  'f8f08773-14c4-427f-b88f-eeecddcc8625',
  'approved',
  false,
  true,
  false,
  24.7136,
  46.6753,
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  'خدمة إصلاح الأجهزة المنزلية',
  'خدمة إصلاح شاملة لجميع الأجهزة المنزلية: ثلاجات، غسالات، مكيفات، مايكرويف. فريق متخصص ومعتمد مع ضمان على الإصلاح.',
  120.00,
  1,
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500',
  ARRAY[
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500'
  ],
  'https://www.youtube.com/watch?v=example123',
  'cat3',
  'service',
  'f8f08773-14c4-427f-b88f-eeecddcc8625',
  'approved',
  true,
  false,
  false,
  24.7136,
  46.6753,
  NOW() - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  'خدمة تنظيف المنازل',
  'خدمة تنظيف شاملة للمنازل والمكاتب. فريق محترف مدرب، مواد تنظيف عالية الجودة، أسعار منافسة. متاح في جميع أنحاء الرياض.',
  200.00,
  1,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  ARRAY[
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500'
  ],
  null,
  'cat5',
  'service',
  'f8f08773-14c4-427f-b88f-eeecddcc8625',
  'approved',
  false,
  true,
  true,
  24.7136,
  46.6753,
  NOW() - INTERVAL '6 hours'
),
(
  gen_random_uuid(),
  'وجبات طعام صحية',
  'وجبات طعام صحية ومتوازنة، محضرة بمكونات طازجة وعالية الجودة. خيارات متنوعة للإفطار والغداء والعشاء. توصيل مجاني.',
  45.00,
  50,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
  ARRAY[
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500'
  ],
  null,
  'cat4',
  'product',
  'f8f08773-14c4-427f-b88f-eeecddcc8625',
  'approved',
  true,
  false,
  false,
  24.7136,
  46.6753,
  NOW() - INTERVAL '4 days'
);

-- Insérer quelques avis sur les produits
INSERT INTO public.product_reviews (product_id, user_id, rating, comment, is_verified_purchase)
SELECT 
  p.id,
  'f8f08773-14c4-427f-b88f-eeecddcc8625'::uuid,
  (ARRAY[4, 5, 5, 4, 5])[floor(random() * 5 + 1)::int],
  (ARRAY[
    'منتج ممتاز وجودة عالية، أنصح بالشراء',
    'خدمة رائعة وسريعة، شكراً لكم',
    'جودة ممتازة وسعر مناسب',
    'تجربة رائعة، سأكرر الطلب',
    'منتج يستحق التقييم العالي'
  ])[floor(random() * 5 + 1)::int],
  true
FROM products p 
WHERE p.seller_id = 'f8f08773-14c4-427f-b88f-eeecddcc8625'
LIMIT 3;

-- Insérer quelques publicités
INSERT INTO public.ads (title, image_url, seller_id, target_url, is_active, start_date, end_date, created_by) VALUES
(
  'عروض خاصة على الإلكترونيات',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
  'f8f08773-14c4-427f-b88f-eeecddcc8625',
  null,
  true,
  NOW(),
  NOW() + INTERVAL '30 days',
  'f8f08773-14c4-427f-b88f-eeecddcc8625'
),
(
  'خدمات منزلية بأفضل الأسعار',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
  'f8f08773-14c4-427f-b88f-eeecddcc8625',
  null,
  true,
  NOW(),
  NOW() + INTERVAL '15 days',
  'f8f08773-14c4-427f-b88f-eeecddcc8625'
);

-- Mettre à jour les statistiques des produits
UPDATE products SET 
  average_rating = 4.5,
  review_count = 3
WHERE seller_id = 'f8f08773-14c4-427f-b88f-eeecddcc8625' AND type = 'product';

UPDATE products SET 
  average_rating = 4.8,
  review_count = 2
WHERE seller_id = 'f8f08773-14c4-427f-b88f-eeecddcc8625' AND type = 'service';
