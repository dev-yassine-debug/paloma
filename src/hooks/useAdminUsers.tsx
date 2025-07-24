
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/index";

export const useAdminUsers = () => {
  const [sellers, setSellers] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('جاري تحميل المستخدمين...');

      // تحميل جميع المستخدمين
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        throw new Error(`خطأ في تحميل المستخدمين: ${usersError.message}`);
      }

      const allUsersData = users || [];
      setAllUsers(allUsersData);
      
      // تعيين sellers ليشمل جميع المستخدمين للعرض في الكومبوننت
      setSellers(allUsersData);

      console.log('تم تحميل المستخدمين بنجاح:', {
        total: allUsersData.length,
        clients: allUsersData.filter(u => u.role === 'client').length,
        sellers: allUsersData.filter(u => u.role === 'seller').length,
        admins: allUsersData.filter(u => u.role === 'admin').length
      });

    } catch (err: any) {
      console.error('خطأ في تحميل المستخدمين:', err);
      const errorMessage = err.message || 'خطأ في تحميل المستخدمين';
      setError(errorMessage);
      toast.error(`خطأ في تحميل المستخدمين: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    sellers, // يحتوي على جميع المستخدمين
    allUsers,
    isLoading,
    error,
    loadDashboardData: loadUsers,
    refetch: loadUsers
  };
};
