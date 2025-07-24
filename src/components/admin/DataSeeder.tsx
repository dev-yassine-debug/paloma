
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, CheckCircle } from "lucide-react";

const DataSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const checkExistingData = async () => {
    try {
      // Check if demo data already exists
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', 'f8f08773-14c4-427f-b88f-eeecddcc8625')
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('خطأ في التحقق من البيانات:', error);
      return false;
    }
  };

  const seedTestData = async () => {
    setLoading(true);
    try {
      // Check if data already exists
      const dataExists = await checkExistingData();
      
      if (dataExists) {
        toast({
          title: "البيانات موجودة",
          description: "البيانات التجريبية موجودة بالفعل في النظام",
        });
        setCompleted(true);
        setLoading(false);
        return;
      }

      // Insert categories if they don't exist
      const categories = [
        { 
          id: 'cat-electronics',
          name_ar: 'إلكترونيات', 
          name_en: 'Electronics', 
          slug: 'electronics', 
          icon: '📱',
          is_active: true,
          priority: 1
        },
        { 
          id: 'cat-clothing',
          name_ar: 'ملابس وأزياء', 
          name_en: 'Clothing & Fashion', 
          slug: 'clothing', 
          icon: '👕',
          is_active: true,
          priority: 2
        },
        { 
          id: 'cat-cleaning',
          name_ar: 'خدمات التنظيف', 
          name_en: 'Cleaning Services', 
          slug: 'cleaning', 
          icon: '🧹',
          is_active: true,
          priority: 3
        },
        { 
          id: 'cat-delivery',
          name_ar: 'خدمات التوصيل', 
          name_en: 'Delivery Services', 
          slug: 'delivery', 
          icon: '🚚',
          is_active: true,
          priority: 4
        }
      ];

      // Insert categories with upsert
      const { error: categoryError } = await supabase
        .from('product_categories')
        .upsert(categories, { onConflict: 'slug' });

      if (categoryError) throw categoryError;

      // Verify demo products exist (they should from the migration)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, type')
        .eq('seller_id', 'f8f08773-14c4-427f-b88f-eeecddcc8625');

      if (productsError) throw productsError;

      const productCount = products?.length || 0;
      const serviceCount = products?.filter(p => p.type === 'service').length || 0;

      toast({
        title: "تم بنجاح",
        description: `تم التحقق من البيانات: ${productCount} منتج/خدمة (${serviceCount} خدمة)`,
      });

      setCompleted(true);
    } catch (error) {
      console.error('خطأ في معالجة البيانات:', error);
      toast({
        title: "خطأ",
        description: "فشل في معالجة البيانات التجريبية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // Count current data
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, type, is_popular, is_new, is_featured')
        .eq('seller_id', 'f8f08773-14c4-427f-b88f-eeecddcc8625');

      if (error) throw error;

      const stats = {
        total: products?.length || 0,
        products: products?.filter(p => p.type === 'product').length || 0,
        services: products?.filter(p => p.type === 'service').length || 0,
        popular: products?.filter(p => p.is_popular).length || 0,
        new: products?.filter(p => p.is_new).length || 0,
        featured: products?.filter(p => p.is_featured).length || 0,
      };

      toast({
        title: "إحصائيات البيانات",
        description: `المجموع: ${stats.total} | منتجات: ${stats.products} | خدمات: ${stats.services} | مميز: ${stats.popular} | جديد: ${stats.new} | مُروج: ${stats.featured}`,
      });

      setCompleted(true);
    } catch (error) {
      console.error('خطأ في تحديث البيانات:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          إدارة البيانات التجريبية
        </CardTitle>
        <CardDescription>
          التحقق من وإدارة البيانات التجريبية للمنتجات والخدمات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={seedTestData} 
            disabled={loading}
            className="w-full"
            variant={completed ? "secondary" : "default"}
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {completed && <CheckCircle className="ml-2 h-4 w-4" />}
            {completed ? 'البيانات جاهزة' : 'التحقق من البيانات التجريبية'}
          </Button>

          <Button 
            onClick={refreshData} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            تحديث الإحصائيات
          </Button>
        </div>

        {completed && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 text-sm">
              ✅ البيانات التجريبية متاحة ويمكن إدارتها من خلال صفحة "إدارة المنتجات المميزة"
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataSeeder;
