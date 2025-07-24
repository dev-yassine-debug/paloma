
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FinancialData {
  // Admin wallet data
  adminWalletBalance: number;
  adminTotalCommissions: number;
  adminTotalCashbacks: number;
  adminTotalTransactions: number;
  
  // Aggregated user data
  totalRevenue: number;
  totalSellersBalance: number;
  totalClientsBalance: number;
  
  // Transactions
  transactions: any[];
  
  // Calculated metrics
  netAdminGain: number;
  systemHealth: {
    adminLiquidity: number;
    commissionRate: number;
    cashbackRate: number;
  };
}

export const useFinancialData = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading financial data...');

      // Get admin wallet data
      const { data: adminWalletData, error: adminWalletError } = await supabase
        .from('admin_wallet')
        .select('*')
        .single();

      if (adminWalletError) {
        console.error('❌ Admin wallet error:', adminWalletError);
        // Create default admin wallet if it doesn't exist
        if (adminWalletError.code === 'PGRST116') {
          const { data: newWallet, error: createError } = await supabase
            .from('admin_wallet')
            .insert({
              balance: 0,
              total_commissions: 0,
              total_cashbacks_paid: 0,
              total_transactions: 0
            })
            .select()
            .single();
          
          if (createError) throw createError;
          console.log('✅ Created admin wallet:', newWallet);
        } else {
          throw adminWalletError;
        }
      }

      console.log('🏦 Admin wallet data:', adminWalletData);

      // Get all transactions - try multiple approaches to ensure we get data
      console.log('📊 Fetching transactions...');
      
      // First try: get transactions with profiles join
      let transactionsData = null;
      let transactionsError = null;
      
      const { data: transWithProfiles, error: transError1 } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          profiles:user_id (
            name,
            phone,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (transError1) {
        console.log('⚠️ Error with profiles join, trying without:', transError1);
        
        // Second try: get transactions without join
        const { data: transWithoutJoin, error: transError2 } = await supabase
          .from('payment_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (transError2) {
          console.error('❌ Failed to fetch transactions:', transError2);
          transactionsError = transError2;
        } else {
          transactionsData = transWithoutJoin;
          console.log('✅ Fetched transactions without profiles:', transactionsData?.length);
        }
      } else {
        transactionsData = transWithProfiles;
        console.log('✅ Fetched transactions with profiles:', transactionsData?.length);
      }

      // If we still have no data, check if there are any transactions at all
      if (!transactionsData || transactionsData.length === 0) {
        const { data: countCheck, error: countError } = await supabase
          .from('payment_transactions')
          .select('id')
          .limit(1);
        
        if (countError) {
          console.error('❌ Error checking transaction count:', countError);
        } else {
          console.log('📊 Total transactions in DB:', countCheck?.length || 0);
        }
      }

      // Get wallets data
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('*');

      if (walletsError) {
        console.error('❌ User wallets error:', walletsError);
        throw walletsError;
      }

      // Get profiles separately to manually join
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role');

      if (profilesError) {
        console.error('❌ Profiles error:', profilesError);
        throw profilesError;
      }

      // Manually join wallets with profiles
      const walletsWithProfiles = walletsData?.map(wallet => {
        const profile = profilesData?.find(p => p.id === wallet.user_id);
        return {
          ...wallet,
          profile: profile
        };
      }) || [];

      // Calculate statistics
      const totalUserWallets = walletsWithProfiles.reduce((sum, w) => sum + (w.balance || 0), 0);
      const sellersBalance = walletsWithProfiles.filter(w => 
        w.profile?.role === 'seller'
      ).reduce((sum, w) => sum + (w.balance || 0), 0);
      
      const clientsBalance = walletsWithProfiles.filter(w => 
        w.profile?.role === 'client'
      ).reduce((sum, w) => sum + (w.balance || 0), 0);

      // Build financial data object
      const financialData: FinancialData = {
        // Admin wallet data (with default values)
        adminWalletBalance: adminWalletData?.balance || 0,
        adminTotalCommissions: adminWalletData?.total_commissions || 0,
        adminTotalCashbacks: adminWalletData?.total_cashbacks_paid || 0,
        adminTotalTransactions: adminWalletData?.total_transactions || 0,
        
        // Aggregated user data
        totalRevenue: totalUserWallets,
        totalSellersBalance: sellersBalance,
        totalClientsBalance: clientsBalance,
        
        // Transaction data
        transactions: transactionsData || [],
        
        // Calculated metrics
        netAdminGain: (adminWalletData?.total_commissions || 0) - (adminWalletData?.total_cashbacks_paid || 0),
        systemHealth: {
          adminLiquidity: totalUserWallets > 0 ? (adminWalletData?.balance || 0) / totalUserWallets : 1,
          commissionRate: totalUserWallets > 0 ? ((adminWalletData?.total_commissions || 0) / totalUserWallets * 100) : 0,
          cashbackRate: totalUserWallets > 0 ? ((adminWalletData?.total_cashbacks_paid || 0) / totalUserWallets * 100) : 0
        }
      };

      console.log('✅ Final financial data:');
      console.log('- Admin balance:', financialData.adminWalletBalance);
      console.log('- Commissions:', financialData.adminTotalCommissions);
      console.log('- Cashbacks:', financialData.adminTotalCashbacks);
      console.log('- Transactions count:', financialData.transactions.length);

      setData(financialData);

      if (transactionsError) {
        toast.error(`Attention: ${transactionsError.message}`);
      }

    } catch (err: any) {
      console.error('💥 Financial data loading error:', err);
      setError(err.message || 'Unknown error');
      toast.error(`Erreur de chargement des données: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const refetch = () => {
    fetchFinancialData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};
