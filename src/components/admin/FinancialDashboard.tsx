
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle,
  RefreshCw,
  Calculator,
  FileText
} from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WalletSummary {
  user_id: string;
  name: string;
  phone: string;
  role: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  total_cashback: number;
}

const FinancialDashboard = () => {
  const { data, loading, refetch } = useFinancialData();
  const [walletSummaries, setWalletSummaries] = useState<WalletSummary[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWalletSummaries = async () => {
    try {
      // Charger les wallets d'abord
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('user_id, balance, total_earned, total_spent, total_cashback')
        .order('balance', { ascending: false });

      if (walletsError) throw walletsError;

      // Ensuite enrichir avec les données des profils
      const summaries = await Promise.all((walletsData || []).map(async (wallet) => {
        let profile = { name: 'Utilisateur inconnu', phone: '', role: 'client' };
        
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, phone, role')
            .eq('id', wallet.user_id)
            .single();
          
          if (profileData) {
            profile = {
              name: profileData.name || 'Utilisateur inconnu',
              phone: profileData.phone || '',
              role: profileData.role || 'client'
            };
          }
        } catch (e) {
          console.log('Could not fetch profile for user:', wallet.user_id);
        }

        return {
          user_id: wallet.user_id,
          name: profile.name,
          phone: profile.phone,
          role: profile.role,
          balance: wallet.balance || 0,
          total_earned: wallet.total_earned || 0,
          total_spent: wallet.total_spent || 0,
          total_cashback: wallet.total_cashback || 0,
        };
      }));

      setWalletSummaries(summaries);
    } catch (error) {
      console.error('Error loading wallet summaries:', error);
      toast.error("Erreur lors du chargement des résumés de wallets");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), loadWalletSummaries()]);
    setIsRefreshing(false);
    toast.success("Données mises à jour");
  };

  useEffect(() => {
    loadWalletSummaries();
  }, []);

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} SAR`;

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'admin': 'Administrateur',
      'seller': 'Vendeur',  
      'client': 'Client'
    };
    return labels[role] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'seller': return 'default';
      case 'client': return 'secondary';
      default: return 'outline';
    }
  };

  const sellerBalances = walletSummaries.filter(w => w.role === 'seller');
  const clientBalances = walletSummaries.filter(w => w.role === 'client');
  const totalSellerPendingPayments = sellerBalances.reduce((sum, w) => sum + w.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des données financières...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actualisation */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de bord financier</h1>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Admin</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data?.adminWalletBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fonds disponibles pour distribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendeurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data?.totalSellersBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              À payer aux vendeurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(data?.totalClientsBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fonds clients disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(data?.adminTotalCommissions || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenus totaux générés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour différentes vues */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sellers">Vendeurs</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="transactions">Transactions récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Résumé des transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Résumé financier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Total Cashbacks</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(data?.adminTotalCashbacks || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Nb Transactions</span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {data?.transactions.length || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">À payer vendeurs</span>
                  </div>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(totalSellerPendingPayments)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Top vendeurs */}
            <Card>
              <CardHeader>
                <CardTitle>Top Vendeurs (Solde)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sellerBalances.slice(0, 5).map((seller) => (
                    <div key={seller.user_id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-gray-500">{seller.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(seller.balance)}</p>
                        <p className="text-xs text-gray-500">
                          Gagné: {formatCurrency(seller.total_earned)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Tous les vendeurs</CardTitle>
              <p className="text-sm text-gray-600">
                Total à payer: {formatCurrency(totalSellerPendingPayments)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sellerBalances.map((seller) => (
                  <div key={seller.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-gray-500">{seller.phone}</p>
                        <Badge variant={getRoleBadgeVariant(seller.role)} className="text-xs">
                          {getRoleLabel(seller.role)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{formatCurrency(seller.balance)}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Gagné: {formatCurrency(seller.total_earned)}</p>
                        <p>Dépensé: {formatCurrency(seller.total_spent)}</p>
                        <p>Cashback: {formatCurrency(seller.total_cashback)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Tous les clients</CardTitle>
              <p className="text-sm text-gray-600">
                Total fonds clients: {formatCurrency(data?.totalClientsBalance || 0)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientBalances.map((client) => (
                  <div key={client.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.phone}</p>
                        <Badge variant={getRoleBadgeVariant(client.role)} className="text-xs">
                          {getRoleLabel(client.role)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(client.balance)}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Dépensé: {formatCurrency(client.total_spent)}</p>
                        <p>Cashback total: {formatCurrency(client.total_cashback)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Les transactions récentes seront affichées ici
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
