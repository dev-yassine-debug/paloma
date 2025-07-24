
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";

interface WalletStats {
  total_users_with_wallets: number;
  total_balance: number;
  total_transactions: number;
  avg_balance: number;
  total_admin_recharges: number;
  total_telr_recharges: number;
  total_cashback: number;
  total_commissions: number;
  admin_wallet_balance: number;
  total_sellers_balance: number;
  total_clients_balance: number;
}

const AdminWalletStatistics = () => {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Chargement des statistiques des portefeuilles...');
      
      // Récupérer les statistiques financières globales
      const { data: financialStats, error: financialError } = await supabase
        .rpc('get_financial_statistics');
      
      if (financialError) {
        console.error('❌ Erreur financière:', financialError);
        throw financialError;
      }

      console.log('📊 Statistiques financières brutes:', financialStats);
      
      // Récupérer les statistiques des portefeuilles
      const { data: walletStats, error: walletError } = await supabase
        .rpc('get_wallet_statistics');
      
      if (walletError) {
        console.error('❌ Erreur portefeuilles:', walletError);
        throw walletError;
      }

      console.log('💰 Statistiques portefeuilles brutes:', walletStats);

      // Vérifier la structure des données et les propriétés disponibles
      const financialData = financialStats && financialStats.length > 0 ? financialStats[0] : null;
      const walletData = walletStats && walletStats.length > 0 ? walletStats[0] : null;

      console.log('📈 Propriétés financières disponibles:', financialData ? Object.keys(financialData) : 'null');
      console.log('💳 Propriétés portefeuilles disponibles:', walletData ? Object.keys(walletData) : 'null');
      
      // Utiliser les données correctes sans duplication
      const combinedStats: WalletStats = {
        total_users_with_wallets: walletData?.total_users_with_wallets ?? 0,
        total_balance: financialData?.total_user_wallets ?? 0, // Utiliser la valeur correcte
        total_transactions: walletData?.total_transactions ?? 0,
        avg_balance: walletData?.avg_balance ?? 0,
        total_admin_recharges: walletData?.total_admin_recharges ?? 0,
        total_telr_recharges: walletData?.total_telr_recharges ?? 0,
        total_cashback: financialData?.total_cashbacks ?? 0,
        total_commissions: financialData?.total_commissions ?? 0,
        admin_wallet_balance: financialData?.admin_wallet_balance ?? 0,
        total_sellers_balance: financialData?.total_sellers_balance ?? 0,
        total_clients_balance: financialData?.total_clients_balance ?? 0
      };

      console.log('✅ Statistiques combinées:', combinedStats);
      setStats(combinedStats);
      
    } catch (error) {
      console.error('💥 Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-2">جاري تحميل الإحصائيات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">لا توجد إحصائيات متاحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          إحصائيات المحافظ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المستخدمين بمحافظ</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_users_with_wallets}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الأرصدة</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_balance)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المعاملات</p>
                <p className="text-2xl font-bold text-purple-600">{stats.total_transactions}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط الرصيد</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.avg_balance)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">شحن إداري</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_admin_recharges)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">شحن تلر</p>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats.total_telr_recharges)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الكاش باك</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.total_cashback)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العمولات</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.total_commissions)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">تفاصيل إضافية</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">رصيد المدير</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.admin_wallet_balance)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">أرصدة البائعين</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.total_sellers_balance)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">أرصدة العملاء</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.total_clients_balance)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminWalletStatistics;
