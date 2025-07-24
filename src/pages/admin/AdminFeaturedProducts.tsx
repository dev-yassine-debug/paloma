
import React from 'react';
import AdminPopularProductsManager from '@/components/admin/AdminPopularProductsManager';

const AdminFeaturedProducts = () => {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة المنتجات المميزة</h1>
        <p className="text-gray-600 mt-2">تحكم في عرض المنتجات والخدمات في الصفحة الرئيسية</p>
      </div>

      <AdminPopularProductsManager />
    </div>
  );
};

export default AdminFeaturedProducts;
