
import AdminWalletOverview from "@/components/admin/AdminWalletOverview";
import AdminWalletManager from "@/components/admin/AdminWalletManager";
import AdminWalletStatistics from "@/components/admin/AdminWalletStatistics";

const AdminWallets = () => {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المحافظ</h1>
        <p className="text-gray-600 mt-1">إدارة محافظ المستخدمين والأرصدة</p>
      </div>

      {/* نظرة عامة على المحافظ */}
      <AdminWalletOverview />

      {/* Statistics Overview */}
      <AdminWalletStatistics />

      {/* Wallet Management */}
      <AdminWalletManager />
    </div>
  );
};

export default AdminWallets;
