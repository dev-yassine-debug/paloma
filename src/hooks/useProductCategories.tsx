
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductCategory {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  icon: string;
  parent_id?: string;
  priority: number;
  is_active: boolean;
  is_popular: boolean;
  is_new: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useProductCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .order('priority', { ascending: true });

      if (categoriesError) {
        throw new Error(`خطأ في تحميل الفئات: ${categoriesError.message}`);
      }

      setCategories(data || []);
    } catch (err: any) {
      console.error('خطأ في تحميل الفئات:', err);
      const errorMessage = err.message || 'خطأ في تحميل الفئات';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveCategories = () => {
    return categories.filter(cat => cat.is_active);
  };

  const getPopularCategories = () => {
    return categories.filter(cat => cat.is_popular && cat.is_active);
  };

  const getFeaturedCategories = () => {
    return categories.filter(cat => cat.is_featured && cat.is_active);
  };

  const getNewCategories = () => {
    return categories.filter(cat => cat.is_new && cat.is_active);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    activeCategories: getActiveCategories(),
    popularCategories: getPopularCategories(),
    featuredCategories: getFeaturedCategories(),
    newCategories: getNewCategories(),
    isLoading,
    error,
    refetch: loadCategories
  };
};
