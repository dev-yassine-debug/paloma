
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product, validateProduct } from "@/types/index";

export const useAdminProducts = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          profiles:seller_id (
            name,
            phone,
            city
          )
        `)
        .order('created_at', { ascending: false });

      if (productsError) {
        throw new Error(`Erreur chargement produits: ${productsError.message}`);
      }

      // Transformer les données pour correspondre au type Product avec validation
      const validatedProducts = (products || []).map(product => validateProduct(product));
      setAllProducts(validatedProducts);

    } catch (err: any) {
      console.error('Erreur lors du chargement des produits:', err);
      const errorMessage = err.message || 'خطأ في تحميل المنتجات';
      setError(errorMessage);
      toast.error(`خطأ في تحميل المنتجات: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    allProducts,
    isLoading,
    error,
    loadDashboardData: loadProducts,
    refetch: loadProducts
  };
};
