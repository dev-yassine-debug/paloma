
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Search, Download } from "lucide-react";

interface AdminTransactionsProps {
  transactions: any[];
}

const AdminTransactions = ({ transactions }: AdminTransactionsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         transaction.user_phone?.includes(searchTerm) || 
                         transaction.description_ar?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTransactionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'purchase': 'شراء',
      'wallet_recharge': 'شحن محفظة',
      'admin_recharge': 'شحن إداري',
      'commission': 'عمولة إدارية',
      'cashback': 'كاشباك',
      'withdrawal': 'سحب',
      'refund': 'استرداد'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'completed': 'default',
      'pending': 'secondary',
      'failed': 'destructive',
      'cancelled': 'outline'
    };

    const labels: { [key: string]: string } = {
      'completed': 'مكتمل',
      'pending': 'معلق',
      'failed': 'فاشل',
      'cancelled': 'ملغي'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
  const completedTransactions = filteredTransactions.filter(t => t.status === 'completed');
  const completedAmount = completedTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
  const totalCommissions = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.commission_amount || '0'), 0);
  const totalCashbacks = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.cashback_amount || '0'), 0);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المعاملات</p>
                <p className="text-2xl font-bold">{filteredTransactions.length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                <p className="text-2xl font-bold text-green-600">{totalAmount.toFixed(2)} ر.س</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العمولات</p>
                <p className="text-2xl font-bold text-purple-600">{totalCommissions.toFixed(2)} ر.س</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الكاشباك</p>
                <p className="text-2xl font-bold text-orange-600">{totalCashbacks.toFixed(2)} ر.س</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>المعاملات المالية</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            إدارة ومراقبة جميع المعاملات المالية في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في المعاملات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="نوع المعاملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="purchase">شراء</SelectItem>
                <SelectItem value="wallet_recharge">شحن محفظة</SelectItem>
                <SelectItem value="admin_recharge">شحن إداري</SelectItem>
                <SelectItem value="commission">عمولة إدارية</SelectItem>
                <SelectItem value="cashback">كاشباك</SelectItem>
                <SelectItem value="withdrawal">سحب</SelectItem>
                <SelectItem value="refund">استرداد</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="حالة المعاملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="failed">فاشل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد معاملات مطابقة للبحث</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {transaction.user_name || 'مستخدم غير محدد'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {transaction.user_phone} • {getTransactionTypeLabel(transaction.type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{parseFloat(transaction.amount || '0').toFixed(2)} ر.س
                      </p>
                      {getStatusBadge(transaction.status)}
                      {transaction.commission_amount > 0 && (
                        <p className="text-xs text-purple-600 mt-1">
                          عمولة: {parseFloat(transaction.commission_amount).toFixed(2)} ر.س
                        </p>
                      )}
                      {transaction.cashback_amount > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          كاشباك: {parseFloat(transaction.cashback_amount).toFixed(2)} ر.س
                        </p>
                      )}
                      {transaction.description_ar && (
                        <p className="text-xs text-gray-500 mt-1 max-w-32 truncate">
                          {transaction.description_ar}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTransactions;
