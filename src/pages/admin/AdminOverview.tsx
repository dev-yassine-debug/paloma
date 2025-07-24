
import React from 'react';
import { RealAnalytics } from '@/components/admin/RealAnalytics';

const AdminOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-royal-dark">التحليلات والتقارير</h1>
        <p className="text-gray-600 mt-2">نظرة شاملة على أداء المنصة والإحصائيات</p>
      </div>

      <RealAnalytics />
    </div>
  );
};

export default AdminOverview;
