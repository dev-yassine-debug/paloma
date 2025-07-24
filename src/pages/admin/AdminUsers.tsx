import { useAdminUsers } from "@/hooks/useAdminUsers";
import AdminUsersManagement from "@/components/admin/AdminUsersManagement";
const AdminUsers = () => {
  const {
    sellers,
    loadDashboardData,
    isLoading
  } = useAdminUsers();
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المستخدمين...</p>
        </div>
      </div>;
  }
  return <div className="space-y-6 bg-yellow-50">
      <div className="rounded-2xl bg-slate-200">
        <h1 className="text-2xl font-bold text-center text-slate-950">إدارة المستخدمين</h1>
        <p className="mt-1 text-center text-slate-900">إدارة جميع المستخدمين والبائعين في النظام</p>
      </div>

      <AdminUsersManagement sellers={sellers} onUpdate={loadDashboardData} />
    </div>;
};
export default AdminUsers;