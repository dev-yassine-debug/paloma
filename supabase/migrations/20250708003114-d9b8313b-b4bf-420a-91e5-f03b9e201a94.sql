-- Insérer quelques produits de test approuvés
INSERT INTO products (name, description, price, quantity, status, category, image_url, seller_id) VALUES
('هاتف ذكي جديد', 'هاتف ذكي بمواصفات عالية وكاميرا ممتازة', 2500.00, 10, 'approved', 'electronics', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', 
  (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1)),
('قميص قطني', 'قميص قطني مريح ومناسب لجميع المناسبات', 150.00, 25, 'approved', 'clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
  (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1)),
('كتاب طبخ', 'كتاب يحتوي على وصفات شهية ومتنوعة', 75.00, 15, 'approved', 'other', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
  (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1)),
('طاولة خشبية', 'طاولة خشبية أنيقة للمنزل', 800.00, 5, 'approved', 'home', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
  (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1)),
('عصير طبيعي', 'عصير فواكه طبيعي بدون إضافات', 25.00, 50, 'approved', 'food', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500',
  (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1));

-- Mettre à jour les timestamps
UPDATE products SET created_at = NOW(), updated_at = NOW() WHERE status = 'approved';