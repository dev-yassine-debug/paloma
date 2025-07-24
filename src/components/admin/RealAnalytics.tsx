
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Users, Package, ShoppingCart, DollarSign, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  topSellers: Array<{
    id: string;
    name: string;
    totalSales: number;
    orderCount: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  monthlyGrowth: number;
}

export const RealAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    topSellers: [],
    topProducts: [],
    dailyStats: [],
    monthlyGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger les données de base
      const [
        { count: totalUsers },
        { count: totalProducts },
        { count: totalOrders },
        { data: revenueData },
        { data: ordersWithSellers },
        { data: productsWithSales }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('payment_transactions').select('amount').eq('status', 'completed'),
        supabase.from('orders')
          .select(`
            id,
            total_amount,
            seller_id,
            created_at,
            profiles!orders_seller_id_fkey(name)
          `)
          .eq('status', 'completed'),
        supabase.from('orders')
          .select(`
            id,
            product_id,
            quantity,
            total_amount,
            products!orders_product_id_fkey(name)
          `)
          .eq('status', 'completed')
      ]);

      const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Calculer les top vendeurs
      const sellerStats = new Map();
      ordersWithSellers?.forEach(order => {
        const sellerId = order.seller_id;
        const sellerName = order.profiles?.name || 'Vendeur inconnu';
        if (!sellerStats.has(sellerId)) {
          sellerStats.set(sellerId, {
            id: sellerId,
            name: sellerName,
            totalSales: 0,
            orderCount: 0
          });
        }
        const seller = sellerStats.get(sellerId);
        seller.totalSales += order.total_amount || 0;
        seller.orderCount += 1;
      });

      const topSellers = Array.from(sellerStats.values())
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      // Calculer les top produits
      const productStats = new Map();
      productsWithSales?.forEach(order => {
        const productId = order.product_id;
        const productName = order.products?.name || 'Produit inconnu';
        if (!productStats.has(productId)) {
          productStats.set(productId, {
            id: productId,
            name: productName,
            totalSold: 0,
            revenue: 0
          });
        }
        const product = productStats.get(productId);
        product.totalSold += order.quantity || 0;
        product.revenue += order.total_amount || 0;
      });

      const topProducts = Array.from(productStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculer les statistiques des 7 derniers jours
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyStats = await Promise.all(
        last7Days.map(async date => {
          const { count: orders } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', date)
            .lt('created_at', date + 'T23:59:59');

          const { data: dayRevenue } = await supabase
            .from('payment_transactions')
            .select('amount')
            .eq('status', 'completed')
            .gte('created_at', date)
            .lt('created_at', date + 'T23:59:59');

          const revenue = dayRevenue?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

          return {
            date,
            orders: orders || 0,
            revenue
          };
        })
      );

      // Calculer la croissance mensuelle (mock pour l'exemple)
      const monthlyGrowth = 12.5;

      setData({
        totalRevenue,
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalUsers: totalUsers || 0,
        topSellers,
        topProducts,
        dailyStats,
        monthlyGrowth
      });

    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError("خطأ في تحميل بيانات التحليلات");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} ريال`;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-2">جاري تحميل التحليلات...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">خطأ في تحميل التحليلات</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAnalyticsData} variant="outline">
            المحاولة مرة أخرى
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasData = data.totalOrders > 0 || data.totalRevenue > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-800 mb-2">لا توجد بيانات كافية للتحليل</h3>
            <p className="text-blue-600">
              ستظهر الإحصائيات والتحليلات هنا بمجرد وجود طلبات ومبيعات في النظام.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">0</div>
                <div className="text-sm text-gray-500">مبيعات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">0</div>
                <div className="text-sm text-gray-500">إيرادات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{data.totalUsers}</div>
                <div className="text-sm text-gray-500">مستخدمين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{data.totalProducts}</div>
                <div className="text-sm text-gray-500">منتجات</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalRevenue)}
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 mt-2">
              +{data.monthlyGrowth}% هذا الشهر
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-2">
              طلبات مكتملة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-2">
              منتجات في المتجر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-2">
              مستخدمين مسجلين
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل البائعين</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topSellers.length > 0 ? (
              <div className="space-y-4">
                {data.topSellers.map((seller, index) => (
                  <div key={seller.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-gray-500">{seller.orderCount} طلبات</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{formatCurrency(seller.totalSales)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد بيانات بائعين بعد</p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length > 0 ? (
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.totalSold} مباع</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد بيانات منتجات بعد</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات الأسبوع الماضي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.dailyStats.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {new Date(day.date).toLocaleDateString('ar-SA', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </p>
                </div>
                <div className="flex space-x-reverse space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">طلبات</p>
                    <p className="font-semibold">{day.orders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">إيرادات</p>
                    <p className="font-semibold">{formatCurrency(day.revenue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
