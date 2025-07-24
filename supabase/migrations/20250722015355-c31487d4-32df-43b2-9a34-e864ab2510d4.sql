
-- Mise à jour de la table products pour supporter les images multiples
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Insertion des produits de démonstration
INSERT INTO products (
  id,
  seller_id,
  name,
  description,
  price,
  quantity,
  category_id,
  type,
  status,
  image_url,
  image_urls,
  video_url,
  is_popular,
  is_new,
  is_featured,
  created_at
) VALUES 
-- Produits
('prod-demo-1', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'هاتف ذكي سامسونج جالاكسي', 'هاتف ذكي متطور بكاميرا عالية الجودة وشاشة كبيرة، مناسب للاستخدام اليومي والألعاب', 2500.00, 15, (SELECT id FROM product_categories WHERE slug = 'electronics' LIMIT 1), 'product', 'approved', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', 'https://images.unsplash.com/photo-1592750854312-a6e84c7b6d1b?w=500', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'], 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, false, true, now()),

('prod-demo-2', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'لابتوب ديل للألعاب', 'لابتوب قوي مخصص للألعاب والبرمجة، معالج سريع وكارت جرافيك متقدم', 4500.00, 8, (SELECT id FROM product_categories WHERE slug = 'electronics' LIMIT 1), 'product', 'approved', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'], null, false, true, false, now()),

('prod-demo-3', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'ثوب رجالي فاخر', 'ثوب رجالي تقليدي مصنوع من أجود الخامات، مناسب للمناسبات الرسمية', 350.00, 25, (SELECT id FROM product_categories WHERE slug = 'clothing' LIMIT 1), 'product', 'approved', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500'], null, true, false, false, now()),

('prod-demo-4', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'عطر عربي أصيل', 'عطر شرقي فاخر بروائح الورد والعود، مناسب لجميع المناسبات', 280.00, 50, (SELECT id FROM product_categories WHERE slug = 'clothing' LIMIT 1), 'product', 'approved', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500', ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=500', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500'], null, false, true, true, now()),

('prod-demo-5', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'ساعة ذكية متطورة', 'ساعة ذكية بميزات صحية متقدمة، مقاومة للماء ومتوافقة مع جميع الهواتف', 890.00, 20, (SELECT id FROM product_categories WHERE slug = 'electronics' LIMIT 1), 'product', 'approved', 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500', ARRAY['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'], 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, false, true, now()),

-- Services
('serv-demo-1', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'خدمة تنظيف المنازل', 'خدمة تنظيف شاملة للمنازل تشمل جميع الغرف والحمامات والمطبخ', 200.00, 1, (SELECT id FROM product_categories WHERE slug = 'cleaning' LIMIT 1), 'service', 'approved', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500', ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'], null, true, false, false, now(), 4, ARRAY['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], '08:00:00', '18:00:00'),

('serv-demo-2', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'خدمة توصيل الطعام', 'خدمة توصيل سريعة للطعام من المطاعم المحلية إلى منزلك', 25.00, 1, (SELECT id FROM product_categories WHERE slug = 'delivery' LIMIT 1), 'service', 'approved', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500', ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500'], null, false, true, true, now(), 1, ARRAY['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'], '10:00:00', '23:00:00'),

('serv-demo-3', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'صيانة أجهزة الكمبيوتر', 'خدمة صيانة وإصلاح أجهزة الكمبيوتر والطابعات في المنازل والمكاتب', 150.00, 1, (SELECT id FROM product_categories WHERE slug = 'cleaning' LIMIT 1), 'service', 'approved', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500', ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'], null, true, false, false, now(), 2, ARRAY['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], '09:00:00', '17:00:00'),

('serv-demo-4', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'دروس خصوصية في الرياضيات', 'دروس خصوصية للطلاب في الرياضيات لجميع المراحل الدراسية', 80.00, 1, (SELECT id FROM product_categories WHERE slug = 'delivery' LIMIT 1), 'service', 'approved', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500', ARRAY['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500', 'https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=500'], 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, true, false, now(), 2, ARRAY['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء'], '16:00:00', '20:00:00'),

('serv-demo-5', 'f8f08773-14c4-427f-b88f-eeecddcc8625', 'خدمة البستنة والزراعة', 'خدمة تنسيق الحدائق وزراعة النباتات والعناية بها', 300.00, 1, (SELECT id FROM product_categories WHERE slug = 'cleaning' LIMIT 1), 'service', 'approved', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500', 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=500'], null, true, true, true, now(), 6, ARRAY['الأربعاء', 'الخميس', 'الجمعة', 'السبت'], '07:00:00', '15:00:00');
