import AdminOrdersManagement from "@/components/admin/AdminOrdersManagement";

const AdminOrders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
        <p className="text-gray-600 mt-1">إدارة جميع الطلبات والمعاملات</p>
      </div>

      <AdminOrdersManagement />
    </div>
  );
};

export default AdminOrders;