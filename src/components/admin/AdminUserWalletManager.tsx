
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Minus, Search, Wallet, RefreshCw, Crown, Star } from "lucide-react";
import { toast } from "sonner";
import RoyalStatsCard from "./RoyalStatsCard";
import { formatCurrency, formatNumber } from "@/utils/numberUtils";

interface UserWithWallet {
  id: string;
  name?: string;
  phone?: string;
  role: string;
  wallet_balance: number;
  wallet_id?: string;
  created_at?: string;
}

const AdminUserWalletManager = () => {
  const [users, setUsers] = useState<UserWithWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithWallet | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDescription, setTransferDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUsersWithWallets();
  }, []);

  const loadUsersWithWallets = async () => {
    try {
      setIsLoading(true);
      console.log('Chargement des utilisateurs et wallets...');

      // Charger les utilisateurs avec leurs wallets
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, phone, role, created_at')
        .neq('role', 'admin');

      if (profilesError) throw profilesError;

      // Charger les wallets
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('user_id, balance, id');

      if (walletsError) throw walletsError;

      console.log('Users chargés:', profiles?.length || 0);
      console.log('Wallets chargés:', wallets?.length || 0);

      // Combiner les données
      const usersWithWallets = profiles?.map(profile => {
        const wallet = wallets?.find(w => w.user_id === profile.id);
        return {
          ...profile,
          wallet_balance: wallet?.balance || 0,
          wallet_id: wallet?.id
        };
      }) || [];

      console.log('Users avec balances:', usersWithWallets.length);
      setUsers(usersWithWallets);
    } catch (error) {
      console.error('Error loading users with wallets:', error);
      toast.error("خطأ في تحميل محافظ المستخدمين");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (type: 'add' | 'subtract') => {
    if (!selectedUser || !transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    try {
      setIsProcessing(true);
      const amount = type === 'add' ? parseFloat(transferAmount) : -parseFloat(transferAmount);

      const { data, error } = await supabase.functions.invoke('wallet-operations', {
        body: {
          operation: 'admin_transfer',
          user_id: selectedUser.id,
          amount: amount,
          description_ar: transferDescription || `${type === 'add' ? 'إضافة' : 'خصم'} رصيد من الإدارة`,
          description_en: transferDescription || `Admin ${type === 'add' ? 'credit' : 'debit'} transfer`
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || "تمت العملية بنجاح");
        setIsTransferDialogOpen(false);
        setTransferAmount("");
        setTransferDescription("");
        setSelectedUser(null);
        await loadUsersWithWallets();
      } else {
        throw new Error(data?.message || "خطأ في العملية");
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(error.message || "خطأ في العملية");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'seller':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'client':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'seller': 'بائع',
      'client': 'عميل'
    };
    return labels[role] || role;
  };

  // Calculate stats
  const totalBalance = users.reduce((sum, user) => sum + user.wallet_balance, 0);
  const sellersBalance = users.filter(u => u.role === 'seller').reduce((sum, user) => sum + user.wallet_balance, 0);
  const clientsBalance = users.filter(u => u.role === 'client').reduce((sum, user) => sum + user.wallet_balance, 0);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-bl from-royal-cream to-white min-h-screen">
      {/* Royal Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-l from-royal-gold/10 to-royal-green/10 rounded-2xl royal-pattern"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-royal-border royal-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-royal-gold to-royal-green rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-royal-dark flex items-center">
                  إدارة المحافظ الملكية
                  <Star className="w-6 h-6 text-royal-gold mr-2" />
                </h1>
                <p className="text-royal-dark/70 mt-1">إدارة محافظ المستخدمين والأرصدة</p>
              </div>
            </div>
            <Button onClick={loadUsersWithWallets} disabled={isLoading} className="royal-button">
              <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RoyalStatsCard
          title="إجمالي المحافظ"
          value={users.length}
          icon={Wallet}
          type="number"
        />
        <RoyalStatsCard
          title="إجمالي الأرصدة"
          value={totalBalance}
          icon={Wallet}
          type="currency"
        />
        <RoyalStatsCard
          title="أرصدة البائعين"
          value={sellersBalance}
          icon={Wallet}
          type="currency"
        />
        <RoyalStatsCard
          title="أرصدة العملاء"
          value={clientsBalance}
          icon={Wallet}
          type="currency"
        />
      </div>

      <Card className="royal-card border-royal-border">
        <CardHeader className="bg-gradient-to-l from-royal-gold/5 to-royal-green/5 border-b border-royal-border">
          <CardTitle className="text-xl font-bold text-royal-dark flex items-center">
            <div className="w-1 h-6 bg-royal-green ml-3 rounded-full"></div>
            محافظ المستخدمين
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute right-3 top-3 text-royal-dark/40" />
              <Input
                placeholder="البحث بالاسم، الهاتف أو الدور..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="royal-input pr-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-green"></div>
              <span className="mr-3 text-royal-dark">جاري التحميل...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-royal-pattern">
                  <TableRow className="border-royal-border">
                    <TableHead className="text-royal-dark font-semibold">المستخدم</TableHead>
                    <TableHead className="text-royal-dark font-semibold">الدور</TableHead>
                    <TableHead className="text-royal-dark font-semibold">رصيد المحفظة</TableHead>
                    <TableHead className="text-royal-dark font-semibold">تاريخ التسجيل</TableHead>
                    <TableHead className="text-royal-dark font-semibold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-royal-cream/30 transition-colors border-royal-border/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-royal-gold/20 to-royal-green/20 rounded-full flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-royal-green" />
                          </div>
                          <div>
                            <p className="font-medium text-royal-dark">{user.name || 'بلا اسم'}</p>
                            <p className="text-sm text-royal-dark/60">{user.phone || 'بلا هاتف'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeVariant(user.role)} border`}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold number-display ${user.wallet_balance > 0 ? 'text-royal-green' : 'text-royal-dark/60'}`}>
                          {formatCurrency(user.wallet_balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-royal-dark/70">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog 
                          open={isTransferDialogOpen && selectedUser?.id === user.id} 
                          onOpenChange={(open) => {
                            setIsTransferDialogOpen(open);
                            if (!open) {
                              setSelectedUser(null);
                              setTransferAmount("");
                              setTransferDescription("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsTransferDialogOpen(true);
                              }}
                              className="royal-button text-xs"
                            >
                              إدارة الرصيد
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="royal-card">
                            <DialogHeader>
                              <DialogTitle className="text-royal-dark flex items-center">
                                <Crown className="w-5 h-5 ml-2" />
                                إدارة محفظة {user.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-gradient-to-r from-royal-gold/5 to-royal-green/5 rounded-lg border border-royal-border">
                                <p className="text-sm text-royal-dark/70">الرصيد الحالي:</p>
                                <p className="text-xl font-bold text-royal-dark number-display">
                                  {formatCurrency(user.wallet_balance)}
                                </p>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-royal-dark">المبلغ</label>
                                <Input
                                  type="number"
                                  placeholder="أدخل المبلغ"
                                  value={transferAmount}
                                  onChange={(e) => setTransferAmount(e.target.value)}
                                  min="0"
                                  step="0.01"
                                  className="royal-input mt-1"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-royal-dark">الوصف (اختياري)</label>
                                <Input
                                  placeholder="سبب التحويل..."
                                  value={transferDescription}
                                  onChange={(e) => setTransferDescription(e.target.value)}
                                  className="royal-input mt-1"
                                />
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleTransfer('add')}
                                  disabled={isProcessing}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Plus className="w-4 h-4 ml-2" />
                                  إضافة رصيد
                                </Button>
                                <Button
                                  onClick={() => handleTransfer('subtract')}
                                  disabled={isProcessing}
                                  variant="outline"
                                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <Minus className="w-4 h-4 ml-2" />
                                  خصم رصيد
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredUsers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-royal-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-royal-dark/40" />
              </div>
              <p className="text-royal-dark/60 text-lg">لا يوجد مستخدمين</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserWalletManager;
