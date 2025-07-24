
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, Wallet, Settings, BarChart3, Shield, Bell, FileText, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [{
  path: '/admin/dashboard',
  label: 'لوحة المعلومات',
  icon: LayoutDashboard
}, {
  path: '/admin/users',
  label: 'إدارة المستخدمين',
  icon: Users
}, {
  path: '/admin/products',
  label: 'إدارة المنتجات',
  icon: Package
}, {
  path: '/admin/orders',
  label: 'إدارة الطلبات',
  icon: ShoppingCart
}, {
  path: '/admin/wallets',
  label: 'إدارة المحافظ',
  icon: Wallet
}, {
  path: '/admin/transactions',
  label: 'المعاملات المالية',
  icon: FileText
}, {
  path: '/admin/analytics',
  label: 'التحليلات والتقارير',
  icon: BarChart3
}, {
  path: '/admin/security',
  label: 'الأمان والمراجعة',
  icon: Shield
}, {

  path: '/admin/featured-products',
  label: 'إدارة المنتجات المميزة',
  icon: Star
}, {
  path: '/admin/settings',
  label: 'الإعدادات العامة',
  icon: Settings
}];

export const AdminSidebarRTL = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Emit custom event to inform the layout
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { isCollapsed: newCollapsedState }
    }));
  };

  return (
    <div className={cn(
      "fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg border-l border-gray-200 z-40 overflow-y-auto my-[27px] rounded-xl transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-6 border-b border-gray-200 my-[29px] py-0 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800">سوق محلي</h2>
            <p className="text-sm text-gray-600">لوحة الإدارة</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        >
          {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      </div>
      
      <nav className="mt-6">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={cn(
                "flex items-center px-6 py-3 text-right transition-colors duration-200",
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600',
                isCollapsed ? "justify-center px-4" : "justify-start"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className={cn("ml-auto", isCollapsed ? "mr-0" : "mr-3")} />
              {!isCollapsed && <span className="mr-3">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 right-4 left-4">
        {/* Footer content if needed */}
      </div>
    </div>
  );
};
