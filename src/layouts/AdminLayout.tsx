import { useEnhancedSession } from '@/hooks/useEnhancedSession';
import { AdminSidebarRTL } from '@/components/admin/AdminSidebarRTL';
import { AdminHeaderRTL } from '@/components/admin/AdminHeaderRTL';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { Outlet } from 'react-router-dom';
const AdminLayout = () => {
  const {
    isLoading,
    isAuthenticated,
    isAdmin,
    error
  } = useEnhancedSession();
  console.log('AdminLayout - Session state:', {
    isLoading,
    isAuthenticated,
    isAdmin,
    error
  });
  if (isLoading) {
    return <LoadingSpinner message="جاري التحقق من الصلاحيات..." />;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في الجلسة</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.href = '/admin-login'} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>;
  }
  if (!isAuthenticated || !isAdmin) {
    console.log('AdminLayout - Redirecting to login. isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);
    window.location.href = '/admin-login';
    return <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">غير مخول</h2>
          <p className="text-gray-600 mb-4">ليس لديك صلاحية للوصول إلى لوحة الإدارة</p>
          <p className="text-sm text-gray-500">جاري إعادة التوجيه...</p>
        </div>
      </div>;
  }
  return <div dir="rtl" className="min-h-screen bg-amber-50">
      <AdminHeaderRTL />
      <div className="flex">
        <AdminSidebarRTL />
        <main className="flex-1 mr-64 p-6 bg-amber-50 px-0 py-0 mx-0 my-[8px]">
          <Outlet />
        </main>
      </div>
    </div>;
};
export default AdminLayout;