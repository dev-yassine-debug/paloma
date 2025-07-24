
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, Users, DollarSign, ShoppingBag, Activity, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFinancialData } from "@/hooks/useFinancialData";
import AdminAnalyticsReal from "./AdminAnalyticsReal";
import AdminTransactionHistory from "./AdminTransactionHistory";
import NotificationCenter from "../notifications/NotificationCenter";

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalClients: number;
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalOrders: number;
  totalRevenue: number;
  commissions: number;
  adminWalletBalance: number;
  totalSellersBalance: number;
  totalClientsBalance: number;
  recentActivity: any[];
}

const RealTimeDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSellers: 0,
    totalClients: 0,
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    commissions: 0,
    adminWalletBalance: 0,
    totalSellersBalance: 0,
    totalClientsBalance: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const {
    data: financialData,
    refetch: refetchFinancialData
  } = useFinancialData();

  const loadDashboardData = useCallback(async () => {
    try {
      console.log('Loading real-time dashboard data...');

      // Charger les statistiques en parallèle
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

      // Charger l'activité récente
      const { data: recentActivity } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          user_profile:user_id(name, phone, role),
          from_profile:from_user_id(name, phone, role),
          to_profile:to_user_id(name, phone, role)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculer les revenus et commissions
      const { data: financialData } = await supabase
        .from('payment_transactions')
        .select('amount, commission_amount, type')
        .eq('status', 'completed');

      const totalRevenue = financialData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const commissions = financialData?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) || 0;

      // Récupérer les données du wallet admin et les soldes
      const { data: adminWalletData } = await supabase
        .from('admin_wallet')
        .select('balance')
        .limit(1)
        .single();

      const { data: sellersBalanceData } = await supabase
        .from('wallets')
        .select('balance, user_id')
        .in('user_id', await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'seller')
          .then(res => res.data?.map(p => p.id) || [])
        );

      const { data: clientsBalanceData } = await supabase
        .from('wallets')
        .select('balance, user_id')
        .in('user_id', await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'client')
          .then(res => res.data?.map(p => p.id) || [])
        );

      const totalSellersBalance = sellersBalanceData?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
      const totalClientsBalance = clientsBalanceData?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalSellers: totalSellers || 0,
        totalClients: totalClients || 0,
        totalProducts: totalProducts || 0,
        pendingProducts: pendingProducts || 0,
        approvedProducts: approvedProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        commissions,
        adminWalletBalance: adminWalletData?.balance || 0,
        totalSellersBalance,
        totalClientsBalance,
        recentActivity: recentActivity || []
      });

      setLastUpdate(new Date());
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Configuration du temps réel avec Supabase
  useEffect(() => {
    console.log('Setting up real-time subscriptions...');

    // Subscription pour les nouveaux utilisateurs
    const usersChannel = supabase
      .channel('dashboard-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('User change detected, refreshing...');
        loadDashboardData();
      })
      .subscribe();

    const productsChannel = supabase
      .channel('dashboard-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        console.log('Product change detected, refreshing...');
        loadDashboardData();
      })
      .subscribe();

    const transactionsChannel = supabase
      .channel('dashboard-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_transactions' }, () => {
        console.log('Transaction change detected, refreshing...');
        loadDashboardData();
        refetchFinancialData();
      })
      .subscribe();

    const ordersChannel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        console.log('Order change detected, refreshing...');
        loadDashboardData();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [loadDashboardData, refetchFinancialData]);

  // Chargement initial
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} SAR`;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-4 h-4 text-green-600" />;
      case 'wallet_recharge':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'cashback':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    const userName = activity.user_profile?.name || 'Utilisateur inconnu';
    switch (activity.type) {
      case 'purchase':
        return `${userName} a effectué un achat de ${formatCurrency(activity.amount)}`;
      case 'wallet_recharge':
        return `${userName} a rechargé son wallet de ${formatCurrency(activity.amount)}`;
      case 'cashback':
        return `${userName} a reçu un cashback de ${formatCurrency(activity.amount)}`;
      default:
        return `${userName} - ${activity.type} de ${formatCurrency(activity.amount)}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement du tableau de bord...</span>
      </div>
    );
  }

  // Adapter les données financières pour AdminAnalyticsReal
  const adaptedFinancialStats = financialData ? {
    totalRevenue: financialData.totalRevenue,
    totalCommissions: financialData.adminTotalCommissions,
    totalCashbacks: financialData.adminTotalCashbacks,
    totalTransactions: financialData.transactions.length,
    adminWalletBalance: financialData.adminWalletBalance,
    totalSellersBalance: financialData.totalSellersBalance,
    totalClientsBalance: financialData.totalClientsBalance,
    transactions: financialData.transactions,
    dailyTransactions: [], // Mock data for now
    monthlyRevenue: [] // Mock data for now
  } : null;

  return (
    <div className="space-y-6">
      {/* Header avec statut temps réel */}
      <div className="flex items-center justify-between my-0 px-0">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord en temps réel</h1>
          <p className="text-muted-foreground">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Temps réel activé
          </Badge>
          <Button variant="outline" onClick={loadDashboardData} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSellers} vendeurs, {stats.totalClients} clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingProducts} en attente d'approbation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Total</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Commissions: {formatCurrency(stats.commissions)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total des commandes passées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les différentes sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistiques financières */}
            <Card>
              <CardHeader>
                <CardTitle>Aperçu financier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Solde Admin</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(financialData?.adminWalletBalance || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Total Vendeurs</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(financialData?.totalSellersBalance || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Total Clients</span>
                  <span className="font-bold text-purple-600">
                    {formatCurrency(financialData?.totalClientsBalance || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Produits par statut */}
            <Card>
              <CardHeader>
                <CardTitle>État des produits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Approuvés</span>
                  <Badge variant="default">{stats.approvedProducts}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">En attente</span>
                  <Badge variant="secondary">{stats.pendingProducts}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total</span>
                  <Badge variant="outline">{stats.totalProducts}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          {adaptedFinancialStats && (
            <AdminAnalyticsReal stats={stats} financialStats={adaptedFinancialStats} />
          )}
        </TabsContent>

        <TabsContent value="transactions">
          <AdminTransactionHistory />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {getActivityMessage(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune activité récente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeDashboard;
