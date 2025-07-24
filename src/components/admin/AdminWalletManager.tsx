import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Plus, Minus, Wallet } from "lucide-react";
import { toast } from "sonner";

interface WalletUser {
  wallet_id: string;
  user_id: string;
  user_name: string;
  phone: string;
  role: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  last_transaction_date: string;
  last_transaction_type: string;
}

const AdminWalletManager = () => {
  const [wallets, setWallets] = useState<WalletUser[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<WalletUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedWallet, setSelectedWallet] = useState<WalletUser | null>(null);
  const [actionAmount, setActionAmount] = useState("");
  const [actionType, setActionType] = useState<"add" | "subtract">("add");
  const [actionDescription, setActionDescription] = useState("");

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    filterWallets();
  }, [wallets, searchTerm, roleFilter]);

  const loadWallets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wallets_overview')
        .select('*')
        .order('balance', { ascending: false });

      if (error) throw error;

      const transformedData: WalletUser[] = (data || []).map(item => ({
        wallet_id: item.wallet_id || '',
        user_id: item.user_id || '',
        user_name: item.user_name || 'Unknown',
        phone: item.phone || '',
        role: item.role || 'client',
        balance: item.balance || 0,
        total_earned: item.total_earned || 0,
        total_spent: item.total_spent || 0,
        last_transaction_date: item.last_transaction_date || '',
        last_transaction_type: item.last_transaction_type || ''
      }));

      setWallets(transformedData);
    } catch (error) {
      console.error('Error loading wallets:', error);
      toast.error("خطأ في تحميل المحافظ");
    } finally {
      setIsLoading(false);
    }
  };

  const filterWallets = () => {
    let filtered = wallets;

    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        w.phone?.includes(searchTerm)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(w => w.role === roleFilter);
    }

    setFilteredWallets(filtered);
  };

  const handleWalletAction = async () => {
    if (!selectedWallet || !actionAmount || isNaN(Number(actionAmount))) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    const amount = Number(actionAmount);
    if (amount <= 0) {
      toast.error("المبلغ يجب أن يكون أكبر من صفر");
      return;
    }

    // للخصم، التحقق من الرصيد المتاح
    if (actionType === "subtract" && selectedWallet.balance < amount) {
      toast.error("الرصيد المتاح غير كافي للخصم");
      return;
    }

    try {
      const finalAmount = actionType === "add" ? amount : -amount;
      const description = actionDescription || (actionType === "add" ? "شحن إداري" : "خصم إداري");

      const { data, error } = await supabase.functions.invoke('wallet-operations', {
        body: {
          operation: 'admin_transfer',
          user_id: selectedWallet.user_id,
          amount: finalAmount,
          description_ar: description,
          description_en: description,
          metadata: {
            action_type: actionType,
            admin_action: true,
            processed_by: 'admin'
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`تم ${actionType === "add" ? "شحن" : "خصم"} المحفظة بنجاح`);
        setSelectedWallet(null);
        setActionAmount("");
        setActionDescription("");
        loadWallets();
      } else {
        throw new Error(data?.error || 'فشل في العملية');
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error("خطأ في تحديث المحفظة");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    const roleLabels: Record<string, string> = {
      'client': 'عميل',
      'seller': 'بائع',
      'admin': 'مدير'
    };
    const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'client': 'default',
      'seller': 'secondary',
      'admin': 'destructive'
    };
    return (
      <Badge variant={roleColors[role] || 'outline'}>
        {roleLabels[role] || role}
      </Badge>
    );
  };

  const totalBalance = filteredWallets.reduce((sum, w) => sum + w.balance, 0);
  const totalEarned = filteredWallets.reduce((sum, w) => sum + (w.total_earned || 0), 0);
  const totalSpent = filteredWallets.reduce((sum, w) => sum + (w.total_spent || 0), 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-2">جاري التحميل...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-yellow-50">
          <CardTitle className="flex items-center justify-between">
            <span>إدارة المحافظ</span>
            <Button variant="outline" size="sm" onClick={loadWallets}>
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-yellow-50">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">إجمالي الأرصدة</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarned)}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث بالاسم أو رقم الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="نوع المستخدم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستخدمين</SelectItem>
                <SelectItem value="client">العملاء</SelectItem>
                <SelectItem value="seller">البائعين</SelectItem>
                <SelectItem value="admin">المديرين</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Wallets Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>الإيرادات</TableHead>
                  <TableHead>المصروفات</TableHead>
                  <TableHead>آخر معاملة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.map((wallet) => (
                  <TableRow key={wallet.wallet_id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {wallet.user_name || 'مستخدم غير محدد'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {wallet.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(wallet.role)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${wallet.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(wallet.balance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(wallet.total_earned || 0)}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {formatCurrency(wallet.total_spent || 0)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p>{formatDate(wallet.last_transaction_date)}</p>
                        <p className="text-xs text-gray-500">{wallet.last_transaction_type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWallet(wallet)}
                      >
                        <Wallet className="w-4 h-4 ml-1" />
                        إدارة
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredWallets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد محافظ مطابقة للبحث</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Action Modal */}
      {selectedWallet && (
        <Card>
          <CardHeader>
            <CardTitle>
              إدارة محفظة {selectedWallet.user_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">الرصيد الحالي</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(selectedWallet.balance)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نوع العملية</label>
                  <Select value={actionType} onValueChange={(value: "add" | "subtract") => setActionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center">
                          <Plus className="w-4 h-4 ml-2 text-green-600" />
                          شحن المحفظة
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract">
                        <div className="flex items-center">
                          <Minus className="w-4 h-4 ml-2 text-red-600" />
                          خصم من المحفظة
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المبلغ</label>
                  <Input
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="أدخل المبلغ"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الوصف (اختياري)</label>
                <Input
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  placeholder="وصف العملية"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleWalletAction} className="flex-1">
                  تنفيذ العملية
                </Button>
                <Button variant="outline" onClick={() => setSelectedWallet(null)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminWalletManager;
