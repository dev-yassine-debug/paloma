
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTokenRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshToken = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing token:', error);
        toast.error('فشل في تحديث الجلسة');
        return false;
      }
      
      if (data.session) {
        toast.success('تم تحديث الجلسة بنجاح');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      toast.error('خطأ في تحديث الجلسة');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refreshToken, isRefreshing };
};
