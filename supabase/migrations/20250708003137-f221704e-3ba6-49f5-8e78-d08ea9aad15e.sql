-- Créer quelques demandes de modification de produits pour tester le panel admin
INSERT INTO product_updates (product_id, seller_id, name, description, price, quantity, notes, status) VALUES
(
  (SELECT id FROM products WHERE name = 'sandala' LIMIT 1),
  (SELECT seller_id FROM products WHERE name = 'sandala' LIMIT 1),
  'سندال جلدي محدث',
  'سندال جلدي عالي الجودة مع تحديثات على التصميم',
  95.00,
  30,
  'تحديث السعر والكمية والوصف',
  'pending'
),
(
  (SELECT id FROM products WHERE name = 'هاتف ذكي جديد' LIMIT 1),
  (SELECT seller_id FROM products WHERE name = 'هاتف ذكي جديد' LIMIT 1),
  'هاتف ذكي متطور',
  'هاتف ذكي بمواصفات محدثة وخصائص جديدة',
  2200.00,
  15,
  'تخفيض السعر وزيادة الكمية',
  'pending'
);