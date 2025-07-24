
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Session, User } from '@supabase/supabase-js';

interface AdminSessionState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
}

export const useAdminSession = () => {
  const navigate = useNavigate();
  const [sessionState, setSessionState] = useState<AdminSessionState>({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    error: null
  });

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      return profile?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  const handleSessionExpired = () => {
    toast.error("🔐 انتهت جلستك. الرجاء تسجيل الدخول من جديد.");
    navigate('/admin-login');
  };

  const handleAuthStateChange = async (event: string, session: Session | null) => {
    console.log('Auth state changed:', event, session);

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
        handleSessionExpired();
      }
      return;
    }

    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed successfully');
      toast.success("تم تحديث الجلسة بنجاح");
    }

    // Vérifier le rôle admin
    const isAdmin = await checkAdminRole(session.user.id);
    
    if (!isAdmin && event !== 'INITIAL_SESSION') {
      await supabase.auth.signOut();
      toast.error("غير مخول للوصول إلى لوحة الإدارة");
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
  };

  useEffect(() => {
    // Configurer l'écoute des changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Vérifier la session initiale
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
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
        console.error('Session initialization error:', error);
        setSessionState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    initializeSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auto-refresh des données toutes les 5 minutes
  useEffect(() => {
    if (!sessionState.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          handleSessionExpired();
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [sessionState.isAuthenticated]);

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      handleSessionExpired();
      return null;
    }
  };

  return {
    session: sessionState.session,
    user: sessionState.user,
    loading: sessionState.isLoading, // Ajout de 'loading' pour compatibilité
    isLoading: sessionState.isLoading,
    isAuthenticated: sessionState.isAuthenticated,
    isAdmin: sessionState.isAdmin,
    error: sessionState.error,
    refreshSession,
    handleSessionExpired
  };
};
