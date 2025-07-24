
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const AdminTransactionHistory = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      console.log('📊 عرض المعاملات: جاري التحميل...');

      // Try multiple ways to get transactions
      let transactionsData = null;
      
      // First attempt: with profiles
      const { data: withProfiles, error: error1 } = await supabase
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
        .limit(200);

      if (error1) {
        console.log('⚠️ خطأ في ربط البروفايلات، جاري المحاولة بدونها:', error1);
        
        // Second attempt: without profiles
        const { data: withoutProfiles, error: error2 } = await supabase
          .from('payment_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        
        if (error2) {
          console.error('❌ فشل في جلب المعاملات:', error2);
          throw error2;
        }
        
        transactionsData = withoutProfiles;
      } else {
        transactionsData = withProfiles;
      }

      console.log('📊 عرض المعاملات:', transactionsData?.length || 0);
      setTransactions(transactionsData || []);

      // Show debug info
      if (!transactionsData || transactionsData.length === 0) {
        // Check if table exists and has any data
        const { data: checkData, error: checkError } = await supabase
          .from('payment_transactions')
          .select('id, created_at, type, status')
          .limit(5);
        
        console.log('🔍 فحص الجدول:', { checkData, checkError });
        
        if (checkError) {
          toast.error(`خطأ في الوصول للجدول: ${checkError.message}`);
        } else if (!checkData || checkData.length === 0) {
          toast.info("الجدول فارغ - لا توجد معاملات مسجلة");
        }
      }

    } catch (error: any) {
      console.error('💥 خطأ في تحميل المعاملات:', error);
      toast.error(`خطأ في التحميل: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'completed': 'default',
      'pending': 'secondary',
      'failed': 'destructive',
      'cancelled': 'outline'
    };
    
    const labels: Record<string, string> = {
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

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      'wallet_recharge': 'شحن محفظة',
      'admin_recharge': 'شحن إداري',
      'purchase': 'شراء',
      'cashback': 'كاشباك',
      'commission': 'عمولة',
      'transfer_in': 'تحويل وارد',
      'transfer_out': 'تحويل صادر',
      'withdrawal': 'سحب',
      'refund': 'استرداد'
    };
    
    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[type] || type}
      </Badge>
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.profiles?.phone?.includes(searchTerm) ||
      transaction.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user_phone?.includes(searchTerm) ||
      transaction.description_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.includes(searchTerm);
    
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>جاري تحميل المعاملات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>سجل المعاملات المالية</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              إجمالي المعاملات: {transactions.length} | المعروضة: {filteredTransactions.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadTransactions} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              تحديث
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              تصدير
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
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
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="نوع المعاملة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="wallet_recharge">شحن محفظة</SelectItem>
              <SelectItem value="admin_recharge">شحن إداري</SelectItem>
              <SelectItem value="purchase">شراء</SelectItem>
              <SelectItem value="commission">عمولة</SelectItem>
              <SelectItem value="cashback">كاشباك</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

        {/* Debug Info */}
        {transactions.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-yellow-800 font-medium">لا توجد معاملات</p>
                <p className="text-yellow-700 text-sm">
                  قد يكون هذا بسبب عدم وجود معاملات في قاعدة البيانات أو مشكلة في الاتصال
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المعاملة</TableHead>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm || typeFilter !== "all" || statusFilter !== "all" 
                        ? "لا توجد معاملات مطابقة للفلاتر المحددة"
                        : "لا توجد معاملات للعرض"
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      <div className="text-xs text-gray-500">
                        {transaction.id.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.profiles?.name || transaction.user_name || 'غير محدد'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.profiles?.phone || transaction.user_phone || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(transaction.type)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTransactionHistory;
