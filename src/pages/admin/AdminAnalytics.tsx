
import React from 'react';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import { useAdminData } from '@/hooks/useAdminData';

const AdminAnalyticsPage = () => {
  const { data: stats, isLoading, error } = useAdminData();

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحليلات</h1>
          <p className="text-gray-600 mt-2">عرض إحصائيات شاملة للمنصة</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحليلات</h1>
          <p className="text-gray-600 mt-2">عرض إحصائيات شاملة للمنصة</p>
        </div>
        <div className="text-center text-red-600">
          <p>خطأ في تحميل البيانات: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحليلات</h1>
        <p className="text-gray-600 mt-2">عرض إحصائيات شاملة للمنصة</p>
      </div>

      <AdminAnalytics stats={stats} />
    </div>
  );
};

export default AdminAnalyticsPage;
