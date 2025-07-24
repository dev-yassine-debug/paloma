
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star, Sparkles, Trophy, Search, Filter, Save, Eye } from 'lucide-react';
import { formatCurrency, formatNumber } from "@/utils/arabic-formatters";
import { Product } from "@/types/index";

interface Category {
  id: string;
  name_ar: string;
  slug: string;
}

interface ExtendedProduct extends Product {
  category_id: string;
  is_popular: boolean;
  is_new: boolean;
  is_featured: boolean;
  product_categories?: {
    name_ar?: string;
    slug?: string;
  };
}

const AdminPopularProductsManager = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeller, setSelectedSeller] = useState<string>('all');
  const [changes, setChanges] = useState<Record<string, Partial<ExtendedProduct>>>({});
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch products with seller and category info
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          profiles:seller_id (name, phone),
          product_categories:category_id (name_ar, slug)
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('id, name_ar, slug')
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      // Transform and validate products
      const transformedProducts = (productsData || []).map(product => ({
        ...product,
        type: (product.type === 'service' ? 'service' : 'product') as 'product' | 'service',
        average_rating: product.average_rating || 0,
        review_count: product.review_count || 0,
        is_popular: product.is_popular || false,
        is_new: product.is_new || false,
        is_featured: product.is_featured || false,
      }));

      setProducts(transformedProducts);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleChange = (productId: string, field: keyof ExtendedProduct, value: boolean) => {
    setChanges(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));

    // Update local state for immediate UI feedback
    setProducts(prev => prev.map(product => 
      product.id === productId ? { ...product, [field]: value } : product
    ));
  };

  const saveChanges = async () => {
    if (Object.keys(changes).length === 0) {
      toast({
        title: "تنبيه",
        description: "لا توجد تغييرات للحفظ"
      });
      return;
    }

    try {
      setSaving(true);

      // Save each changed product
      for (const [productId, productChanges] of Object.entries(changes)) {
        const { error } = await supabase
          .from('products')
          .update(productChanges)
          .eq('id', productId);

        if (error) throw error;
      }

      setChanges({});
      toast({
        title: "تم الحفظ",
        description: `تم حفظ التغييرات لـ ${formatNumber(Object.keys(changes).length)} منتج/خدمة`
      });

      await fetchData(); // Refresh data
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ التغييرات",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesSeller = selectedSeller === 'all' || product.seller_id === selectedSeller;
    
    return matchesSearch && matchesCategory && matchesType && matchesSeller;
  });

  // Get unique sellers
  const uniqueSellers = Array.from(new Set(products.map(p => p.seller_id))).map(id => {
    const product = products.find(p => p.seller_id === id);
    return {
      id,
      name: product?.profiles?.name || `بائع ${id?.slice(0, 8) || ''}`
    };
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            إدارة المنتجات المميزة
          </CardTitle>
          <CardDescription>
            تحكم في عرض المنتجات والخدمات كمنتجات مميزة أو جديدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ابحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="product">منتج</SelectItem>
                  <SelectItem value="service">خدمة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>البائع</Label>
              <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                <SelectTrigger className="bg-slate-100">
                  <SelectValue placeholder="جميع البائعين" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البائعين</SelectItem>
                  {uniqueSellers.map(seller => (
                    <SelectItem key={seller.id} value={seller.id || ''}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Save Changes Button */}
          {Object.keys(changes).length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="text-blue-800">
                  لديك {formatNumber(Object.keys(changes).length)} تغييرات غير محفوظة
                </div>
                <Button
                  onClick={saveChanges}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid gap-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden mx-[5px] px-0">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Eye className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={product.type === 'product' ? 'default' : 'secondary'}>
                              {product.type === 'product' ? 'منتج' : 'خدمة'}
                            </Badge>
                            <Badge variant="outline">
                              {product.product_categories?.name_ar || 'غير محدد'}
                            </Badge>
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            البائع: {product.profiles?.name || 'غير محدد'}
                          </div>
                        </div>

                        {/* Toggle Controls */}
                        <div className="flex flex-col gap-3 ml-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={product.is_popular}
                              onCheckedChange={(checked) => 
                                handleToggleChange(product.id, 'is_popular', checked)
                              }
                              className="bg-lime-700 hover:bg-lime-600"
                            />
                            <Label className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 text-yellow-500" />
                              مميز
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={product.is_new}
                              onCheckedChange={(checked) => 
                                handleToggleChange(product.id, 'is_new', checked)
                              }
                              className="bg-indigo-800 hover:bg-indigo-700"
                            />
                            <Label className="flex items-center gap-1 text-sm">
                              <Sparkles className="w-4 h-4 text-green-500" />
                              جديد
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={product.is_featured}
                              onCheckedChange={(checked) => 
                                handleToggleChange(product.id, 'is_featured', checked)
                              }
                            />
                            <Label className="flex items-center gap-1 text-sm">
                              <Trophy className="w-4 h-4 text-purple-500" />
                              مُروج
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لم يتم العثور على منتجات تطابق المعايير المحددة
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {formatNumber(products.filter(p => p.is_popular).length)}
              </div>
              <div className="text-sm text-muted-foreground">منتج مميز</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(products.filter(p => p.is_new).length)}
              </div>
              <div className="text-sm text-muted-foreground">منتج جديد</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(products.filter(p => p.is_featured).length)}
              </div>
              <div className="text-sm text-muted-foreground">منتج مُروج</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(products.length)}
              </div>
              <div className="text-sm text-muted-foreground">المجموع الكلي</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPopularProductsManager;
