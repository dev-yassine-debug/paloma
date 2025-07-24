
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  Bell, 
  Star, 
  Crown, 
  Sparkles 
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "التحليلات والتقارير",
      icon: LayoutDashboard,
      path: "/admin/analytics",
      active: location.pathname === "/admin/analytics" || location.pathname === "/admin"
    },
    {
      label: "إدارة المحافظ",
      icon: Wallet,
      path: "/admin/wallets",
      active: location.pathname === "/admin/wallets"
    },
    {
      label: "الإشعارات وإدارة الإعلانات",
      icon: Bell,
      path: "/admin/notifications",
      active: location.pathname === "/admin/notifications"
    },
    {
      label: "المنتجات الشائعة",
      icon: Star,
      path: "/admin/popular-products",
      active: location.pathname === "/admin/popular-products"
    },
    {
      label: "المنتجات المميزة",
      icon: Crown,
      path: "/admin/featured-products",
      active: location.pathname === "/admin/featured-products"
    },
    {
      label: "المنتجات الجديدة",
      icon: Sparkles,
      path: "/admin/new-products",
      active: location.pathname === "/admin/new-products"
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-l">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">لوحة الإدارة</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={item.active ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-right h-11",
                item.active && "bg-blue-600 text-white hover:bg-blue-700"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="ml-3 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
