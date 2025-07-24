
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface WalletAnalyticsProps {
  financialData: any;
}

const WalletAnalytics = ({ financialData }: WalletAnalyticsProps) => {
  if (!financialData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const dailyData = financialData.dailyTransactions || [];
  const monthlyData = financialData.monthlyRevenue || [];

  // Données pour le graphique en secteurs
  const pieData = [
    { name: 'محافظ العملاء', value: financialData.totalClientsBalance, color: '#3B82F6' },
    { name: 'صندوق الإدارة', value: financialData.adminWalletBalance, color: '#10B981' },
    { name: 'محافظ البائعين', value: financialData.totalSellersBalance, color: '#F59E0B' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">تحليلات الأداء المالي</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المعاملات اليومية */}
        <Card>
          <CardHeader>
            <CardTitle>المعاملات اليومية (آخر 30 يوم)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')}
                  formatter={(value: number) => [formatCurrency(value), "المبلغ"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* الإيرادات الشهرية */}
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "المبلغ"]} />
                <Bar dataKey="revenue" fill="#10B981" name="الإيرادات" />
                <Bar dataKey="commissions" fill="#8B5CF6" name="العمولات" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* توزيع الأموال */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الأموال في النظام</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* مؤشرات الأداء الرئيسية */}
        <Card>
          <CardHeader>
            <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">متوسط المعاملة</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(
                    financialData.totalTransactions > 0
                      ? financialData.totalRevenue / financialData.totalTransactions
                      : 0
                  )}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">معدل العمولة</span>
                <span className="text-lg font-bold text-green-600">
                  {financialData.totalRevenue > 0
                    ? ((financialData.totalCommissions / financialData.totalRevenue) * 100).toFixed(2)
                    : '0'
                  }%
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">معدل الكاشباك</span>
                <span className="text-lg font-bold text-purple-600">
                  {financialData.totalRevenue > 0
                    ? ((financialData.totalCashbacks / financialData.totalRevenue) * 100).toFixed(2)
                    : '0'
                  }%
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">نسبة السيولة</span>
                <span className="text-lg font-bold text-orange-600">
                  {financialData.totalRevenue > 0
                    ? ((financialData.adminWalletBalance / financialData.totalRevenue) * 100).toFixed(1)
                    : '0'
                  }%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletAnalytics;
