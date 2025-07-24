
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalClients: number;
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalOrders: number;
  totalRevenue: number;
  commissions: number;
  adminWalletBalance: number;
  totalSellersBalance: number;
  totalClientsBalance: number;
  monthlyOrders: number;
  urgentOrders: number;
}

interface FinancialData {
  total_user_wallets: number;
  total_admin_funds: number;
  total_pending_funds: number;
  total_transactions_count: number;
  total_commissions: number;
  total_cashbacks: number;
  daily_transactions: any;
  monthly_revenue: any;
  admin_wallet_balance: number;
  total_sellers_balance: number;
  total_clients_balance: number;
}

export const useAdminData = () => {
  const [data, setData] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Chargement des données admin...');

      // Charger les statistiques financières via RPC
      const { data: financialData, error: financialError } = await supabase
        .rpc('get_financial_statistics');

      if (financialError) {
        console.error('Erreur financière:', financialError);
        throw new Error(`Erreur données financières: ${financialError.message}`);
      }

      // Charger les statistiques des utilisateurs
      const [
        { count: totalUsers },
        { count: totalSellers },
        { count: totalClients },
        { count: totalProducts },
        { count: pendingProducts },
        { count: approvedProducts },
        { count: totalOrders }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'seller'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('orders').select('id', { count: 'exact', head: true })
      ]);

      // Utiliser les données financières de la RPC avec type safety
      const financialStats = (financialData?.[0] as FinancialData) || {} as FinancialData;

      const adminStats: AdminStats = {
        totalUsers: totalUsers || 0,
        totalSellers: totalSellers || 0,
        totalClients: totalClients || 0,
        totalProducts: totalProducts || 0,
        activeProducts: approvedProducts || 0,
        pendingProducts: pendingProducts || 0,
        approvedProducts: approvedProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: financialStats.total_user_wallets || 0,
        commissions: financialStats.total_commissions || 0,
        adminWalletBalance: financialStats.admin_wallet_balance || 0,
        totalSellersBalance: financialStats.total_sellers_balance || 0,
        totalClientsBalance: financialStats.total_clients_balance || 0,
        monthlyOrders: totalOrders || 0,
        urgentOrders: Math.floor((pendingProducts || 0) * 0.3) // Exemple de calcul
      };

      setData(adminStats);
      console.log('Données admin chargées avec succès:', adminStats);

    } catch (err: any) {
      console.error('Erreur lors du chargement des données admin:', err);
      const errorMessage = err.message || 'خطأ في تحميل البيانات';
      setError(errorMessage);
      toast.error(`خطأ في تحميل البيانات: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: loadAdminData
  };
};
