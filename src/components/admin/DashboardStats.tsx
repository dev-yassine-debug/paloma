import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingProducts: number;
  todayOrders: number;
  adminWalletBalance: number;
  totalCommissions: number;
  totalCashbacks: number;
}

export const DashboardStats = () => {
  const [data, setData] = useState<DashboardData>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingProducts: 0,
    todayOrders: 0,
    adminWalletBalance: 0,
    totalCommissions: 0,
    totalCashbacks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        { count: totalUsers },
        { count: totalProducts },
        { count: totalOrders },
        { count: pendingProducts },
        { data: revenueData },
        { data: adminWallet },
        { count: todayOrders },
        { data: commissionsData },
        { data: cashbacksData }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payment_transactions').select('amount').eq('status', 'completed'),
        supabase.from('admin_wallet').select('balance, total_commissions, total_cashbacks_paid').limit(1).single(),
        supabase.from('orders').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('payment_transactions').select('commission_amount').gt('commission_amount', 0),
        supabase.from('payment_transactions').select('cashback_amount').gt('cashback_amount', 0)
      ]);

      const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalCommissions = commissionsData?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0;
      const totalCashbacks = cashbacksData?.reduce((sum, t) => sum + (t.cashback_amount || 0), 0) || 0;

      setData({
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        pendingProducts: pendingProducts || 0,
        todayOrders: todayOrders || 0,
        adminWalletBalance: adminWallet?.balance || 0,
        totalCommissions: adminWallet?.total_commissions || totalCommissions,
        totalCashbacks: adminWallet?.total_cashbacks_paid || totalCashbacks
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError("فشل تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} ر.س`;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">حدث خطأ</h3>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{data.totalUsers}</div>
          <p className="text-xs text-muted-foreground">عدد المستخدمين المسجلين</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
          <Package className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{data.totalProducts}</div>
          <div className="flex items-center gap-2 mt-1">
            {data.pendingProducts > 0 && (
              <Badge variant="secondary" className="text-xs">
                {data.pendingProducts} قيد المراجعة
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
          <ShoppingCart className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{data.totalOrders}</div>
          <p className="text-xs text-muted-foreground">{data.todayOrders} اليوم</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
          <DollarSign className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(data.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            رصيد الإدارة: {formatCurrency(data.adminWalletBalance)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">العمولات (5%)</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data.totalCommissions)}
          </div>
          <p className="text-xs text-muted-foreground">إجمالي العمولات من المبيعات</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">استرداد نقدي (1.5%)</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.totalCashbacks)}
          </div>
          <p className="text-xs text-muted-foreground">إجمالي ما تم دفعه للعملاء</p>
        </CardContent>
      </Card>
    </div>
  );
};
