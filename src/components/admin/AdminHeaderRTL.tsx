import React from 'react';
import { Bell, User, LogOut, Shield, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedSession } from '@/hooks/useEnhancedSession';
import { formatDate } from '@/utils/arabic-formatters';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
export const AdminHeaderRTL = () => {
  const {
    user,
    session,
    //logSecurityEvent
  } = useEnhancedSession();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
     // await logSecurityEvent('admin_logout_attempt');
      await supabase.auth.signOut();
      toast.success('تم تسجيل الخروج بنجاح');
      //navigate('/admin-login');
    } catch (error) {
      toast.error('خطأ في تسجيل الخروج');
      console.error('خطأ في تسجيل الخروج:', error);
      //navigate('/admin-login');
    }
  };
  const sessionExpiresAt = session?.expires_at ? new Date(session.expires_at * 1000) : null;
  return <header className="shadow-sm border-b border-gray-200 py-[15px] px-[15px] bg-inherit">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-reverse space-x-4">
          <h1 className="text-xl font-semibold text-inherit">
            مرحباً بك في لوحة الإدارة
          </h1>
          {sessionExpiresAt && <div className="flex items-center text-sm text-gray-500">
              
              
            </div>}
        </div>
        
        <div className="flex items-center space-x-reverse space-x-4">
          {/* إشعارات */}
          
          
          {/* معلومات المستخدم */}
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="text-right my-0 mx-[135px] bg-inherit">
              
              <p className="flex items-center text-xl text-inherit mx-0">
                
                مشرف النظام
              </p>
            </div>
            
          </div>
          
          {/* زر تسجيل الدخول كمسؤول */}
          <button onClick={() => navigate('/admin-login')} className="flex items-center space-x-reverse space-x-2 px-4 py-2 rounded-lg transition-colors bg-blue-700 hover:bg-blue-800 text-white">
            <span className="text-xl">  تحديث</span>
            <Shield size={16} />
          </button>
          {/* تسجيل الخروج */}
          <button onClick={handleLogout} className="flex items-center space-x-reverse space-x-2 px-4 py-2 rounded-lg transition-colors bg-slate-950 hover:bg-slate-800 text-slate-50">
            <span className="text-xl">خروج</span>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>;
};