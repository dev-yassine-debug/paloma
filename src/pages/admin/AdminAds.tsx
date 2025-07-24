import AdminAdsManager from "@/components/admin/AdminAdsManager";

const AdminAds = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة الإعلانات</h1>
        <p className="text-gray-600 mt-1">إدارة الإعلانات والحملات الترويجية</p>
      </div>

      <AdminAdsManager />
    </div>
  );
};

export default AdminAds;