import { AdminCommissionsHistory } from "@/components/admin/AdminCommissionsHistory";

const AdminCommissions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة العمولات</h1>
        <p className="text-gray-600 mt-1">عرض وإدارة العمولات والأرباح</p>
      </div>

      <AdminCommissionsHistory />
    </div>
  );
};

export default AdminCommissions;