
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Calculator } from "lucide-react";
import CommissionCalculator from "./CommissionCalculator";
import SystemHealthMonitor from "./SystemHealthMonitor";

interface FinancialOverviewProps {
  financialData: any;
}

const FinancialOverview = ({ financialData }: FinancialOverviewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount || 0);
  };

  if (!financialData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "إجمالي أرصدة المستخدمين",
      value: formatCurrency(financialData.totalRevenue),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "صندوق الإدارة",
      value: formatCurrency(financialData.adminWalletBalance),
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "إجمالي العمولات",
      value: formatCurrency(financialData.adminTotalCommissions),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "إجمالي الكاشباك",
      value: formatCurrency(financialData.adminTotalCashbacks),
      icon: DollarSign,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "عدد المعاملات",
      value: financialData.adminTotalTransactions?.toLocaleString('ar-SA') || '0',
      icon: CreditCard,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      title: "أرصدة البائعين",
      value: formatCurrency(financialData.totalSellersBalance),
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">نظرة عامة مالية</h2>
        <Badge variant="outline" className="text-sm">
          آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
        </Badge>
      </div>

      {/* System Health Monitor */}
      <SystemHealthMonitor />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission Calculator and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CommissionCalculator />
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معدل العمولة والكاشباك</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">العمولة الإجمالية</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(financialData.adminTotalCommissions || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">الكاشباك المدفوع</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(financialData.adminTotalCashbacks || 0)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-600">صافي ربح الإدارة</span>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(financialData.netAdminGain || 0)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل العمولة</span>
                    <span className="font-semibold">5.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل الكاشباك</span>
                    <span className="font-semibold">1.5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">مؤشرات الأداء المالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">العمولة / إجمالي المعاملات</span>
                <span className="font-semibold">
                  {financialData.totalRevenue > 0 
                    ? ((financialData.adminTotalCommissions / financialData.totalRevenue) * 100).toFixed(2)
                    : '0'
                  }%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">الكاشباك / إجمالي المعاملات</span>
                <span className="font-semibold">
                  {financialData.totalRevenue > 0 
                    ? ((financialData.adminTotalCashbacks / financialData.totalRevenue) * 100).toFixed(2)
                    : '0'
                  }%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">صحة النظام المالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">نسبة السيولة</span>
                <Badge variant={
                  (financialData.systemHealth?.adminLiquidity || 0) > 0.1 
                    ? 'default' 
                    : 'destructive'
                }>
                  {((financialData.systemHealth?.adminLiquidity || 0) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">أرصدة العملاء</span>
                <Badge variant="outline">
                  {formatCurrency(financialData.totalClientsBalance)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
