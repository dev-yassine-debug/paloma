-- Performance optimizations: Add missing indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_location ON public.products(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_updates_seller_id ON public.product_updates(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_updates_status ON public.product_updates(status);
CREATE INDEX IF NOT EXISTS idx_product_updates_created_at ON public.product_updates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_locations_seller_id ON public.seller_locations(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_locations_active ON public.seller_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_seller_locations_coordinates ON public.seller_locations(latitude, longitude) WHERE is_active = true;

-- Add composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_status_seller ON public.products(status, seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_dates ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_rating ON public.product_reviews(product_id, rating);

-- Performance optimization: Update product rating function to be more efficient
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  avg_rating NUMERIC;
  review_count INTEGER;
BEGIN
  -- Use more efficient aggregation
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.product_reviews 
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
  
  -- Update product with new ratings
  UPDATE public.products 
  SET 
    average_rating = avg_rating,
    review_count = review_count,
    updated_at = now()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create triggers for automatic rating updates
DROP TRIGGER IF EXISTS trigger_update_product_rating_insert ON public.product_reviews;
DROP TRIGGER IF EXISTS trigger_update_product_rating_update ON public.product_reviews;
DROP TRIGGER IF EXISTS trigger_update_product_rating_delete ON public.product_reviews;

CREATE TRIGGER trigger_update_product_rating_insert
  AFTER INSERT ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER trigger_update_product_rating_update
  AFTER UPDATE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_rating();

CREATE TRIGGER trigger_update_product_rating_delete
  AFTER DELETE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_rating();

-- Ensure updated_at triggers exist for all tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for tables that need them
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON public.payment_transactions;
DROP TRIGGER IF EXISTS update_product_updates_updated_at ON public.product_updates;
DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
DROP TRIGGER IF EXISTS update_seller_locations_updated_at ON public.seller_locations;
DROP TRIGGER IF EXISTS update_commission_settings_updated_at ON public.commission_settings;
DROP TRIGGER IF EXISTS update_promotions_updated_at ON public.promotions;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_updates_updated_at
  BEFORE UPDATE ON public.product_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_locations_updated_at
  BEFORE UPDATE ON public.seller_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commission_settings_updated_at
  BEFORE UPDATE ON public.commission_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();