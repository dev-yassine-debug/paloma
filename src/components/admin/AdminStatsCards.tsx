
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Package,
  Clock,
  CheckCircle,
  Wallet
} from "lucide-react";

interface AdminStatsCardsProps {
  stats: any;
}

const AdminStatsCards = ({ stats }: AdminStatsCardsProps) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} ر.س`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" dir="rtl">
      {/* إجمالي المستخدمين */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{stats.totalSellers} بائع</Badge>
            <Badge variant="outline">{stats.totalClients} عميل</Badge>
          </div>
        </CardContent>
      </Card>

      {/* المنتجات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
          <Package className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.totalProducts}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              {stats.approvedProducts} مُوافق عليه
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Clock className="w-3 h-3 mr-1" />
              {stats.pendingProducts} في الانتظار
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* الأرصدة */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">رصيد الإدارة</CardTitle>
          <Wallet className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.adminWalletBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            المتاح للتوزيع
          </p>
        </CardContent>
      </Card>

      {/* الإيرادات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            العمولات: {formatCurrency(stats.commissions)}
          </p>
        </CardContent>
      </Card>

      {/* رصيد البائعين */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أرصدة البائعين</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalSellersBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            المُستحق للبائعين
          </p>
        </CardContent>
      </Card>

      {/* رصيد العملاء */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أرصدة العملاء</CardTitle>
          <Wallet className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalClientsBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            أموال العملاء المتاحة
          </p>
        </CardContent>
      </Card>

      {/* الطلبات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
          <ShoppingBag className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            جميع الطلبات المُسجلة
          </p>
        </CardContent>
      </Card>

      {/* نسبة التحويل */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">نسبة التحويل</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {stats.totalProducts > 0 ? ((stats.totalOrders / stats.totalProducts) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            من المنتجات إلى الطلبات
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsCards;
