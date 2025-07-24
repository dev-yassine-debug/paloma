
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw } from "lucide-react";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  const { refreshToken, isRefreshing } = useTokenRefresh();

  const handleRefreshToken = async () => {
    await refreshToken();
  };

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshToken}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'جاري التحديث...' : 'تحديث الجلسة'}
          </Button>
          <Button variant="destructive" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
