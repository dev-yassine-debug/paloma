
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FinancialStatistics {
  total_user_wallets: number;
  total_admin_funds: number;
  total_pending_funds: number;
  total_transactions_count: number;
  total_commissions: number;
  total_cashbacks: number;
  daily_transactions: any[];
  monthly_revenue: any[];
  admin_wallet_balance: number;
  total_sellers_balance: number;
  total_clients_balance: number;
}

export const useFinancialData = () => {
  const [financialStats, setFinancialStats] = useState<FinancialStatistics | null>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinancialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger les statistiques financières globales avec la fonction améliorée
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_financial_statistics');

      if (statsError) throw statsError;

      console.log('Financial statistics:', statsData);
      
      // Corriger le parsing des données JSON
      if (statsData && statsData[0]) {
        const stats = statsData[0];
        const processedStats: FinancialStatistics = {
          total_user_wallets: stats.total_user_wallets || 0,
          total_admin_funds: stats.total_admin_funds || 0,
          total_pending_funds: stats.total_pending_funds || 0,
          total_transactions_count: stats.total_transactions_count || 0,
          total_commissions: stats.total_commissions || 0,
          total_cashbacks: stats.total_cashbacks || 0,
          admin_wallet_balance: stats.admin_wallet_balance || 0,
          total_sellers_balance: stats.total_sellers_balance || 0,
          total_clients_balance: stats.total_clients_balance || 0,
          daily_transactions: Array.isArray(stats.daily_transactions) 
            ? stats.daily_transactions 
            : typeof stats.daily_transactions === 'string' 
              ? JSON.parse(stats.daily_transactions) 
              : [],
          monthly_revenue: Array.isArray(stats.monthly_revenue) 
            ? stats.monthly_revenue 
            : typeof stats.monthly_revenue === 'string' 
              ? JSON.parse(stats.monthly_revenue) 
              : []
        };
        setFinancialStats(processedStats);
      }

      // Charger toutes les transactions avec les informations utilisateur intégrées
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (transactionsError) throw transactionsError;

      console.log('All transactions with user info:', transactionsData);
      setAllTransactions(transactionsData || []);

    } catch (error: any) {
      console.error('Error loading financial data:', error);
      setError(error.message);
      toast.error("خطأ في تحميل البيانات المالية");
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionsByType = (type: string) => {
    return allTransactions.filter(t => t.type === type);
  };

  const getTransactionsByStatus = (status: string) => {
    return allTransactions.filter(t => t.status === status);
  };

  const getTransactionsByDateRange = (startDate: Date, endDate: Date) => {
    return allTransactions.filter(t => {
      const transactionDate = new Date(t.created_at);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  return {
    financialStats,
    allTransactions,
    isLoading,
    error,
    loadFinancialData,
    getTransactionsByType,
    getTransactionsByStatus,
    getTransactionsByDateRange,
  };
};
