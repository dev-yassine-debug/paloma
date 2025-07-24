
-- Vérifier et initialiser les paramètres de commission par défaut
INSERT INTO commission_settings (customer_commission_percent, cashback_percent, seller_withdrawal_fee_percent)
VALUES (5.00, 1.50, 2.50)
ON CONFLICT DO NOTHING;

-- S'assurer qu'il y a au moins une ligne de paramètres
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM commission_settings) THEN
    INSERT INTO commission_settings (customer_commission_percent, cashback_percent, seller_withdrawal_fee_percent)
    VALUES (5.00, 1.50, 2.50);
  END IF;
END $$;
