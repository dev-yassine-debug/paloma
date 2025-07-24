
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Session, User } from '@supabase/supabase-js';

interface SessionState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
}

export const useEnhancedSession = () => {
  const navigate = useNavigate();
  const [sessionState, setSessionState] = useState<SessionState>({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    error: null
  });

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      return profile?.role === 'admin';
    } catch (error) {
      console.error('خطأ في التحقق من دور المشرف:', error);
      return false;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      console.log('تم تحديث الجلسة بنجاح');
      return data.session;
    } catch (error) {
      console.error('فشل في تحديث الجلسة:', error);
      handleSessionExpired();
      return null;
    }
  }, []);

  const handleSessionExpired = useCallback(() => {
    toast.error("انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى");
    navigate('/admin-login');
  }, [navigate]);

  const logSecurityEvent = useCallback(async (action: string, details: any = {}) => {
    try {
      await supabase.rpc('log_security_event', {
        p_user_id: sessionState.user?.id,
        p_action: action,
        p_resource_type: 'session',
        p_details: details,
        p_severity: 'info'
      });
    } catch (error) {
      console.error('فشل في تسجيل حدث الأمان:', error);
    }
  }, [sessionState.user?.id]);

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('تغيير حالة المصادقة:', event, session);

    if (event === 'SIGNED_OUT' || !session) {
      setSessionState({
        session: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        error: null
      });
      
      if (event === 'SIGNED_OUT') {
        await logSecurityEvent('user_signed_out');
        handleSessionExpired();
      }
      return;
    }

    if (event === 'TOKEN_REFRESHED') {
      console.log('تم تحديث الرمز المميز بنجاح');
      toast.success("تم تحديث الجلسة بنجاح");
      await logSecurityEvent('token_refreshed');
    }

    // التحقق من دور المشرف
    const isAdmin = await checkAdminRole(session.user.id);
    
    if (!isAdmin && event !== 'INITIAL_SESSION') {
      await supabase.auth.signOut();
      toast.error("غير مخول للوصول إلى لوحة الإدارة");
      await logSecurityEvent('unauthorized_admin_access_attempt');
      navigate('/admin-login');
      return;
    }

    setSessionState({
      session,
      user: session.user,
      isLoading: false,
      isAuthenticated: true,
      isAdmin,
      error: null
    });

    if (event === 'SIGNED_IN') {
      await logSecurityEvent('admin_signed_in');
    }
  }, [checkAdminRole, handleSessionExpired, logSecurityEvent, navigate]);

  useEffect(() => {
    // إعداد مراقبة تغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // التحقق من الجلسة الأولية
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('خطأ في الحصول على الجلسة:', error);
          setSessionState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error.message 
          }));
          return;
        }

        if (session) {
          await handleAuthStateChange('INITIAL_SESSION', session);
        } else {
          setSessionState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('خطأ في تهيئة الجلسة:', error);
        setSessionState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'خطأ غير معروف'
        }));
      }
    };

    initializeSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  // تحديث تلقائي للجلسة كل 5 دقائق
  useEffect(() => {
    if (!sessionState.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          handleSessionExpired();
        } else {
          // التحقق من انتهاء صلاحية الرمز المميز قريباً (5 دقائق)
          const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;

          if (expiresAt - now < fiveMinutes) {
            await refreshSession();
          }
        }
      } catch (error) {
        console.error('فشل في فحص الجلسة:', error);
      }
    }, 5 * 60 * 1000); // 5 دقائق

    return () => clearInterval(interval);
  }, [sessionState.isAuthenticated, handleSessionExpired, refreshSession]);

  return {
    ...sessionState,
    refreshSession,
    handleSessionExpired,
    logSecurityEvent
  };
};
