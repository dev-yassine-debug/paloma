
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface WalletOverview {
  adminBalance: number;
  totalUserWallets: number;
  totalSellersBalance: number;
  totalClientsBalance: number;
  totalCommissions: number;
  totalCashbacks: number;
  pendingTransactions: number;
}

const AdminWalletOverview = () => {
  const [overview, setOverview] = useState<WalletOverview>({
    adminBalance: 0,
    totalUserWallets: 0,
    totalSellersBalance: 0,
    totalClientsBalance: 0,
    totalCommissions: 0,
    totalCashbacks: 0,
    pendingTransactions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletOverview();
  }, []);

  const loadWalletOverview = async () => {
    try {
      setIsLoading(true);

      console.log('🔄 Chargement de la vue d\'ensemble des portefeuilles...');

      // Récupérer les statistiques financières globales
      const { data: financialStats, error: financialError } = await supabase
        .rpc('get_financial_statistics');

      if (financialError) {
        console.error('❌ Erreur financière:', financialError);
        throw financialError;
      }

      console.log('📊 Données financières brutes:', financialStats);

      // Récupérer les transactions en attente
      const { count: pendingCount, error: pendingError } = await supabase
        .from('payment_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError && pendingError.code !== 'PGRST116') {
        console.error('❌ Erreur transactions en attente:', pendingError);
        throw pendingError;
      }

      // Vérifier la structure des données reçues
      const financialData = financialStats && financialStats.length > 0 ? financialStats[0] : null;

      console.log('📈 Données financières traitées:', financialData);

      // Utiliser directement les valeurs de get_financial_statistics qui sont déjà correctes
      const overviewData: WalletOverview = {
        adminBalance: financialData?.admin_wallet_balance ?? 0,
        totalUserWallets: financialData?.total_user_wallets ?? 0, // Utiliser la valeur correcte de la fonction
        totalSellersBalance: financialData?.total_sellers_balance ?? 0,
        totalClientsBalance: financialData?.total_clients_balance ?? 0,
        totalCommissions: financialData?.total_commissions ?? 0,
        totalCashbacks: financialData?.total_cashbacks ?? 0,
        pendingTransactions: pendingCount || 0
      };

      console.log('✅ Vue d\'ensemble finale:', overviewData);
      setOverview(overviewData);

    } catch (error) {
      console.error('💥 Erreur lors du chargement de la vue d\'ensemble:', error);
      toast.error("خطأ في تحميل نظرة عامة على المحافظ");
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-royal-dark">نظرة عامة على المحافظ</h2>
        <Button onClick={loadWalletOverview} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-0 my-0">
        {/* محفظة المدير */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-green-800">
              <span>محفظة المدير</span>
              <Wallet className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">
              {formatCurrency(overview.adminBalance)}
            </div>
            <p className="text-sm text-green-600">
              الرصيد المتاح للإدارة
            </p>
          </CardContent>
        </Card>

        {/* إجمالي أرصدة المستخدمين */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-blue-800">
              <span>إجمالي أرصدة المستخدمين</span>
              <Users className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {formatCurrency(overview.totalUserWallets)}
            </div>
            <p className="text-sm text-blue-600">
              مجموع أرصدة جميع المستخدمين
            </p>
          </CardContent>
        </Card>

        {/* أرصدة البائعين */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-purple-800">
              <span>أرصدة البائعين</span>
              <TrendingUp className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {formatCurrency(overview.totalSellersBalance)}
            </div>
            <p className="text-sm text-purple-600">
              المبالغ المستحقة للبائعين
            </p>
          </CardContent>
        </Card>

        {/* أرصدة العملاء */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-orange-800">
              <span>أرصدة العملاء</span>
              <DollarSign className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 mb-2">
              {formatCurrency(overview.totalClientsBalance)}
            </div>
            <p className="text-sm text-orange-600">
              أرصدة العملاء المتاحة
            </p>
          </CardContent>
        </Card>

        {/* إجمالي العمولات */}
        <Card className="border-2 border-indigo-200 bg-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-indigo-800">
              <span>إجمالي العمولات</span>
              <TrendingUp className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700 mb-2">
              {formatCurrency(overview.totalCommissions)}
            </div>
            <p className="text-sm text-indigo-600">
              العمولات المحصلة للإدارة
            </p>
          </CardContent>
        </Card>

        {/* الكاش باك */}
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-red-800">
              <span>إجمالي الكاش باك</span>
              <TrendingDown className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 mb-2">
              {formatCurrency(overview.totalCashbacks)}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600">
                الكاش باك المدفوع للعملاء
              </p>
              {overview.pendingTransactions > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {overview.pendingTransactions} معلق
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminWalletOverview;
