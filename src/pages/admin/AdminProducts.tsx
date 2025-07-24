import { useAdminProducts } from "@/hooks/useAdminProducts";
import AdminProductsManagement from "@/components/admin/AdminProductsManagement";
const AdminProducts = () => {
  const {
    allProducts,
    loadDashboardData,
    isLoading
  } = useAdminProducts();
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المنتجات...</p>
        </div>
      </div>;
  }
  return <div className="space-y-6 mx-0 px-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
        <p className="text-gray-600 mt-1">إدارة جميع المنتجات والخدمات في النظام</p>
      </div>

      <AdminProductsManagement allProducts={allProducts} onUpdate={loadDashboardData} />
    </div>;
};
export default AdminProducts;