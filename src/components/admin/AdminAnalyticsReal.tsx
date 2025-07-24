
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Calendar } from "lucide-react";
import { formatCurrency, formatNumber } from '@/utils/numberUtils';

// Define types directly in this file
interface AdminStats {
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
}

interface FinancialData {
  totalRevenue: number;
  totalCommissions: number;
  totalCashbacks: number;
  totalTransactions: number;
  adminWalletBalance: number;
  totalSellersBalance: number;
  totalClientsBalance: number;
  transactions: any[];
  dailyTransactions: any[];
  monthlyRevenue: any[];
}

interface AnalyticsProps {
  stats: AdminStats;
  financialStats: FinancialData;
}

const AdminAnalyticsReal = ({ stats, financialStats }: AnalyticsProps) => {
  
  // Données pour le graphique des utilisateurs
  const userDistributionData = useMemo(() => [
    { name: 'البائعون', value: stats.totalSellers, color: '#3b82f6' },
    { name: 'العملاء', value: stats.totalClients, color: '#10b981' },
    { name: 'الإداريون', value: stats.totalUsers - stats.totalSellers - stats.totalClients, color: '#f59e0b' }
  ], [stats]);

  // Données pour le graphique des produits
  const productStatusData = useMemo(() => [
    { name: 'موافق عليها', value: stats.approvedProducts, color: '#10b981' },
    { name: 'في الانتظار', value: stats.pendingProducts, color: '#f59e0b' },
    { name: 'أخرى', value: stats.totalProducts - stats.approvedProducts - stats.pendingProducts, color: '#ef4444' }
  ], [stats]);

  // Données financières pour graphique en aires
  const financialTrendsData = useMemo(() => {
    if (!financialStats?.dailyTransactions || !Array.isArray(financialStats.dailyTransactions)) {
      return [];
    }
    
    return financialStats.dailyTransactions.slice(-7).map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit' }),
      transactions: item.count || 0,
      revenue: item.amount || 0,
      commissions: (item.amount || 0) * 0.1 // Estimation 10% commission
    }));
  }, [financialStats]);

  // Métriques de performance
  const performanceMetrics = useMemo(() => {
    const totalBalance = (financialStats?.totalSellersBalance || 0) + (financialStats?.totalClientsBalance || 0);
    const conversionRate = stats.totalProducts > 0 ? (stats.totalOrders / stats.totalProducts * 100) : 0;
    const avgOrderValue = stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders) : 0;
    const commissionRate = stats.totalRevenue > 0 ? (stats.commissions / stats.totalRevenue * 100) : 0;

    return {
      totalBalance,
      conversionRate,
      avgOrderValue,
      commissionRate
    };
  }, [stats, financialStats]);

  // Top vendeurs fictifs (à remplacer par de vraies données)
  const topSellersData = [
    { name: 'متجر أحمد', sales: 15420, commission: 1542, growth: 12.5 },
    { name: 'متجر فاطمة', sales: 12380, commission: 1238, growth: 8.3 },
    { name: 'إلكترونيات محمد', sales: 10950, commission: 1095, growth: -2.1 },
    { name: 'أزياء عائشة', sales: 9870, commission: 987, growth: 15.7 },
    { name: 'تقنيات عمر', sales: 8650, commission: 865, growth: 5.2 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-royal-border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes('مبلغ') || entry.name.includes('revenue') || entry.name.includes('commissions') 
                  ? formatCurrency(entry.value) 
                  : formatNumber(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="royal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-royal-dark/80">إجمالي الأرصدة</p>
                <p className="text-2xl font-bold text-blue-600 number-display">
                  {formatCurrency(performanceMetrics.totalBalance)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-royal-dark/60 mt-2">
              الأموال المتاحة على المنصة
            </p>
          </CardContent>
        </Card>

        <Card className="royal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-royal-dark/80">معدل التحويل</p>
                <p className="text-2xl font-bold text-green-600 number-display">
                  ٪{formatNumber(performanceMetrics.conversionRate, 1)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-royal-dark/60 mt-2">
              المنتجات ← الطلبات
            </p>
          </CardContent>
        </Card>

        <Card className="royal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-royal-dark/80">متوسط السلة</p>
                <p className="text-2xl font-bold text-purple-600 number-display">
                  {formatCurrency(performanceMetrics.avgOrderValue)}
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-royal-dark/60 mt-2">
              القيمة المتوسطة لكل طلب
            </p>
          </CardContent>
        </Card>

        <Card className="royal-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-royal-dark/80">معدل العمولة</p>
                <p className="text-2xl font-bold text-orange-600 number-display">
                  ٪{formatNumber(performanceMetrics.commissionRate, 1)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-royal-dark/60 mt-2">
              العمولة على الإيرادات
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des tendances financières */}
        <Card className="royal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              الاتجاهات المالية (آخر ٧ أيام)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={financialTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="الإيرادات"
                />
                <Area 
                  type="monotone" 
                  dataKey="commissions" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="العمولات"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution des utilisateurs */}
        <Card className="royal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              توزيع المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${formatNumber(percent * 100, 0)}٪`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* État des produits */}
        <Card className="royal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              حالة المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6">
                  {productStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top vendeurs */}
        <Card className="royal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              أفضل البائعين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellersData.map((seller, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-royal-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm number-display">
                      {formatNumber(index + 1)}
                    </div>
                    <div>
                      <p className="font-medium">{seller.name}</p>
                      <p className="text-sm text-royal-dark/60">
                        العمولة: <span className="number-display">{formatCurrency(seller.commission)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold number-display">{formatCurrency(seller.sales)}</p>
                    <div className="flex items-center gap-1">
                      {seller.growth > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={`text-xs number-display ${seller.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {seller.growth > 0 ? '+' : ''}{formatNumber(seller.growth, 1)}٪
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions mensuelles */}
      {financialStats?.monthlyRevenue && (
        <Card className="royal-card">
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={financialStats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  name="الإيرادات"
                />
                <Line 
                  type="monotone" 
                  dataKey="commissions" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  name="العمولات"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAnalyticsReal;
