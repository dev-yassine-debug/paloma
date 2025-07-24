
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useEnhancedSession } from '@/hooks/useEnhancedSession';
import { AdminSidebarRTL } from './AdminSidebarRTL';
import { AdminHeaderRTL } from './AdminHeaderRTL';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';

export const AdminLayoutRTL = () => {
  const { isLoading, isAuthenticated, isAdmin, error } = useEnhancedSession();
  const [sidebarWidth, setSidebarWidth] = useState('16rem');

  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarWidth(event.detail.isCollapsed ? '4rem' : '16rem');
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="جاري تحميل لوحة الإدارة..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ في النظام</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">غير مخول</h1>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى لوحة الإدارة</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="flex">
          <AdminSidebarRTL />
          <div 
            className="flex-1 flex flex-col min-h-screen transition-all duration-300" 
            style={{ marginRight: sidebarWidth }}
          >
            <AdminHeaderRTL />
            <main className="flex-1 p-6 bg-gray-50">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
