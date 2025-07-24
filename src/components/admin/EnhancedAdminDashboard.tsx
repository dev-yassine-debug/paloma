import React, { useState, useEffect } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { formatCurrency, formatNumber, formatDate } from '@/utils/numberUtils';
import { Users, Package, ShoppingCart, Wallet, TrendingUp, AlertTriangle, CheckCircle, Clock, Download, Crown, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RoyalStatsCard from './RoyalStatsCard';
import { LoadingSpinner } from './LoadingSpinner';
export const EnhancedAdminDashboard = () => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useAdminData();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [autoRefresh, setAutoRefresh] = useState(true);
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);
  if (isLoading) {
    return <LoadingSpinner message="جاري تحميل بيانات لوحة الإدارة..." />;
  }
  if (error) {
    return <div className="p-6 text-center" dir="rtl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">خطأ في تحميل البيانات</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refetch} className="royal-button">
          إعادة المحاولة
        </Button>
      </div>;
  }
  const statsCards = [{
    title: 'إجمالي المستخدمين',
    value: data?.totalUsers || 0,
    icon: Users,
    trend: {
      value: 5.2,
      direction: 'up' as const,
      label: 'من الشهر الماضي'
    }
  }, {
    title: 'المنتجات النشطة',
    value: data?.activeProducts || 0,
    icon: Package,
    trend: {
      value: 2.8,
      direction: 'up' as const,
      label: 'من الشهر الماضي'
    }
  }, {
    title: 'الطلبات هذا الشهر',
    value: data?.monthlyOrders || 0,
    icon: ShoppingCart,
    trend: {
      value: 12.5,
      direction: 'up' as const,
      label: 'من الشهر الماضي'
    }
  }, {
    title: 'إجمالي الإيرادات',
    value: data?.totalRevenue || 0,
    icon: Wallet,
    type: 'currency' as const,
    trend: {
      value: 8.7,
      direction: 'up' as const,
      label: 'من الشهر الماضي'
    }
  }];
  return <div dir="rtl" className="space-y-6 p-6 bg-gradient-to-bl from-royal-cream to-white min-h-screen bg-amber-100">
      {/* Header with Royal Design */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-l from-royal-gold/10 to-royal-green/10 rounded-2xl royal-pattern"></div>
        <div className="relative backdrop-blur-sm rounded-2xl p-6 border border-royal-border royal-shadow bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-royal-gold to-royal-green flex items-center justify-center rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center text-center mx-[28px] text-slate-50">
                  لوحة المعلومات 
                  <Star className="w-6 h-6 text-royal-gold mr-2" />
                </h1>
                <p className="mt-1 text-slate-50">آخر تحديث: {formatDate(new Date().toISOString())}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-4 px-[9px] mx-0">
              <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="royal-input mx-[29px]">
                <option value="day">اليوم</option>
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="year">هذا العام</option>
              </select>
              
              <Button className="royal-button">
                <Download className="w-4 h-4 ml-2" />
                تصدير التقرير
              </Button>
              
              <label className="flex items-center space-x-reverse space-x-2 mx-0">
                <span className="text-sm text-slate-50">تحديث تلقائي</span>
                <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded border-royal-border mx-[7px]" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => <RoyalStatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} type={stat.type} trend={stat.trend} className="fade-in" />)}
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="royal-card border-royal-border">
          <CardHeader className="bg-gradient-to-l from-yellow-50 to-orange-50">
            <CardTitle className="flex items-center text-royal-dark">
              <AlertTriangle className="ml-2 h-5 w-5 text-yellow-600 mx-[23px]" />
              المهام العاجلة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-royal-dark">منتجات تحتاج مراجعة</p>
                  <p className="text-sm text-royal-dark/70">
                    <span className="number-display">{formatNumber(data?.pendingProducts || 0)}</span> منتج في الانتظار
                  </p>
                </div>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-royal-dark">طلبات تحتاج متابعة</p>
                  <p className="text-sm text-royal-dark/70">
                    <span className="number-display">{formatNumber(data?.urgentOrders || 0)}</span> طلب عاجل
                  </p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="royal-card border-royal-border">
          <CardHeader className="bg-gradient-to-l from-green-50 to-emerald-50">
            <CardTitle className="flex items-center text-royal-dark text-center mx-[25px] px-0">
              <CheckCircle className="ml-2 h-5 w-5 text-green-600 mx-[38px]" />
              النشاطات الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-reverse space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="w-3 h-3 bg-royal-green rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-royal-dark">تم إضافة منتج جديد</p>
                  <p className="text-xs text-royal-dark/60">منذ ٥ دقائق</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-reverse space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-royal-dark">تسجيل مستخدم جديد</p>
                  <p className="text-xs text-royal-dark/60">منذ ١٠ دقائق</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-reverse space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-royal-dark">طلب جديد تم استلامه</p>
                  <p className="text-xs text-royal-dark/60">منذ ١٥ دقيقة</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};