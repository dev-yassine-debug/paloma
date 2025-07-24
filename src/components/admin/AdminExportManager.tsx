import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Calendar, Filter, Database, Users, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const AdminExportManager = () => {
  const [exportType, setExportType] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const exportOptions = [{
    value: "transactions",
    label: "Transactions",
    icon: DollarSign,
    description: "Exporter toutes les transactions"
  }, {
    value: "users",
    label: "Utilisateurs",
    icon: Users,
    description: "Exporter la liste des utilisateurs"
  }, {
    value: "products",
    label: "Produits",
    icon: ShoppingBag,
    description: "Exporter la liste des produits"
  }, {
    value: "financial",
    label: "Rapport Financier",
    icon: TrendingUp,
    description: "Rapport financier complet"
  }, {
    value: "orders",
    label: "Commandes",
    icon: Database,
    description: "Exporter toutes les commandes"
  }];
  const convertToCSV = (data: any[], headers: string[]) => {
    const csvContent = [headers.join(','), ...data.map(row => headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et entourer de guillemets si nécessaire
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))].join('\n');
    return csvContent;
  };
  const downloadFile = (content: string, filename: string, type: string = 'csv') => {
    const mimeType = type === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([content], {
      type: `${mimeType};charset=utf-8;`
    });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  const exportTransactions = async () => {
    try {
      let query = supabase.from('payment_transactions').select('*').order('created_at', {
        ascending: false
      });
      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo.toISOString());
      }
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      const processedData = data?.map((t: any) => ({
        id: t.id,
        date: new Date(t.created_at).toLocaleString('fr-FR'),
        type: t.type,
        amount: t.amount,
        commission: t.commission_amount || 0,
        cashback: t.cashback_amount || 0,
        status: t.status,
        user_id: t.user_id || '',
        from_user_id: t.from_user_id || '',
        to_user_id: t.to_user_id || '',
        description_ar: t.description_ar || '',
        description_en: t.description_en || ''
      })) || [];
      const headers = ['id', 'date', 'type', 'amount', 'commission', 'cashback', 'status', 'user_id', 'from_user_id', 'to_user_id', 'description_ar', 'description_en'];
      const csv = convertToCSV(processedData, headers);
      const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csv, filename);
      toast.success(`${processedData.length} transactions exportées avec succès`);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error("Erreur lors de l'export des transactions");
    }
  };
  const exportUsers = async () => {
    try {
      const {
        data: profiles,
        error: profilesError
      } = await supabase.from('profiles').select('*').order('created_at', {
        ascending: false
      });
      if (profilesError) throw profilesError;
      const {
        data: wallets,
        error: walletsError
      } = await supabase.from('wallets').select('user_id, balance, total_earned, total_spent, total_cashback');
      if (walletsError) throw walletsError;
      const processedData = profiles?.map((user: any) => {
        const userWallet = wallets?.find((w: any) => w.user_id === user.id);
        return {
          id: user.id,
          name: user.name || '',
          phone: user.phone || '',
          role: user.role,
          city: user.city || '',
          created_at: new Date(user.created_at).toLocaleString('fr-FR'),
          wallet_balance: userWallet?.balance || 0,
          total_earned: userWallet?.total_earned || 0,
          total_spent: userWallet?.total_spent || 0,
          total_cashback: userWallet?.total_cashback || 0
        };
      }) || [];
      const headers = ['id', 'name', 'phone', 'role', 'city', 'created_at', 'wallet_balance', 'total_earned', 'total_spent', 'total_cashback'];
      const csv = convertToCSV(processedData, headers);
      const filename = `users_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csv, filename);
      toast.success(`${processedData.length} utilisateurs exportés avec succès`);
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error("Erreur lors de l'export des utilisateurs");
    }
  };
  const exportProducts = async () => {
    try {
      const {
        data: products,
        error: productsError
      } = await supabase.from('products').select('*').order('created_at', {
        ascending: false
      });
      if (productsError) throw productsError;
      const {
        data: profiles,
        error: profilesError
      } = await supabase.from('profiles').select('id, name, phone, city');
      if (profilesError) throw profilesError;
      const processedData = products?.map((product: any) => {
        const seller = profiles?.find((p: any) => p.id === product.seller_id);
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category || '',
          type: product.type,
          status: product.status,
          seller_name: seller?.name || '',
          seller_phone: seller?.phone || '',
          seller_city: seller?.city || '',
          created_at: new Date(product.created_at).toLocaleString('fr-FR'),
          average_rating: product.average_rating || 0,
          review_count: product.review_count || 0,
          views_count: product.views_count || 0
        };
      }) || [];
      const headers = ['id', 'name', 'description', 'price', 'category', 'type', 'status', 'seller_name', 'seller_phone', 'seller_city', 'created_at', 'average_rating', 'review_count', 'views_count'];
      const csv = convertToCSV(processedData, headers);
      const filename = `products_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csv, filename);
      toast.success(`${processedData.length} produits exportés avec succès`);
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error("Erreur lors de l'export des produits");
    }
  };
  const exportFinancialReport = async () => {
    try {
      // Obtenir les statistiques financières
      const {
        data: financialStats,
        error: statsError
      } = await supabase.rpc('get_financial_statistics');
      if (statsError) throw statsError;

      // Obtenir les données détaillées
      const [{
        data: transactions
      }, {
        data: wallets
      }, {
        data: commissions
      }] = await Promise.all([supabase.from('payment_transactions').select('*').order('created_at', {
        ascending: false
      }).limit(1000), supabase.from('wallets').select('*, profiles(name, role)'), supabase.from('commission_history').select('*').order('created_at', {
        ascending: false
      }).limit(500)]);
      const report = {
        generated_at: new Date().toISOString(),
        period: {
          from: dateFrom?.toISOString() || 'Début',
          to: dateTo?.toISOString() || 'Maintenant'
        },
        summary: financialStats?.[0] || {},
        transactions_count: transactions?.length || 0,
        wallets_count: wallets?.length || 0,
        commissions_count: commissions?.length || 0,
        top_transactions: transactions?.slice(0, 10) || [],
        wallet_summary: wallets?.map((w: any) => ({
          user_name: 'Utilisateur',
          role: 'client',
          balance: w.balance,
          total_earned: w.total_earned,
          total_spent: w.total_spent,
          total_cashback: w.total_cashback
        })) || []
      };
      const filename = `financial_report_${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(JSON.stringify(report, null, 2), filename, 'json');
      toast.success("Rapport financier exporté avec succès");
    } catch (error) {
      console.error('Error exporting financial report:', error);
      toast.error("Erreur lors de l'export du rapport financier");
    }
  };
  const exportOrders = async () => {
    try {
      let query = supabase.from('orders').select('*').order('created_at', {
        ascending: false
      });
      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo.toISOString());
      }
      const {
        data: orders,
        error: ordersError
      } = await query;
      if (ordersError) throw ordersError;
      const {
        data: products
      } = await supabase.from('products').select('id, name, price');
      const {
        data: profiles
      } = await supabase.from('profiles').select('id, name, phone');
      const processedData = orders?.map((order: any) => {
        const product = products?.find((p: any) => p.id === order.product_id);
        const buyer = profiles?.find((p: any) => p.id === order.buyer_id);
        const seller = profiles?.find((p: any) => p.id === order.seller_id);
        return {
          id: order.id,
          product_name: product?.name || '',
          product_price: product?.price || 0,
          quantity: order.quantity,
          total_amount: order.total_amount,
          commission: order.commission || 0,
          cashback: order.cashback || 0,
          status: order.status,
          payment_method: order.payment_method || '',
          buyer_name: buyer?.name || '',
          buyer_phone: buyer?.phone || '',
          seller_name: seller?.name || '',
          seller_phone: seller?.phone || '',
          created_at: new Date(order.created_at).toLocaleString('fr-FR'),
          service_date: order.service_date ? new Date(order.service_date).toLocaleDateString('fr-FR') : '',
          service_time: order.service_time || ''
        };
      }) || [];
      const headers = ['id', 'product_name', 'product_price', 'quantity', 'total_amount', 'commission', 'cashback', 'status', 'payment_method', 'buyer_name', 'buyer_phone', 'seller_name', 'seller_phone', 'created_at', 'service_date', 'service_time'];
      const csv = convertToCSV(processedData, headers);
      const filename = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csv, filename);
      toast.success(`${processedData.length} commandes exportées avec succès`);
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error("Erreur lors de l'export des commandes");
    }
  };
  const handleExport = async () => {
    if (!exportType) {
      toast.error("Veuillez sélectionner un type d'export");
      return;
    }
    setIsExporting(true);
    try {
      switch (exportType) {
        case 'transactions':
          await exportTransactions();
          break;
        case 'users':
          await exportUsers();
          break;
        case 'products':
          await exportProducts();
          break;
        case 'financial':
          await exportFinancialReport();
          break;
        case 'orders':
          await exportOrders();
          break;
        default:
          toast.error("Type d'export non reconnu");
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };
  return <Card className="py-0 mx-px my-px px-[4px]">
      <CardHeader className="py-0 my-[36px]">
        <CardTitle className="flex items-center gap-2 text-center">
          <Download className="w-5 h-5" />
          Gestionnaire d'Export
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center px-[29px]">
          Exportez les données de la plateforme en formats CSV ou JSON
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection du type d'export */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportOptions.map(option => <Card key={option.value} className={`cursor-pointer transition-all hover:shadow-md ${exportType === option.value ? 'ring-2 ring-primary' : ''}`} onClick={() => setExportType(option.value)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <option.icon className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        <Separator />

        {/* Filtres */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtres (Optionnel)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-0 px-[28px] py-[13px] my-[16px]">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <DatePicker date={dateFrom} setDate={setDateFrom} />
            </div>
            
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <DatePicker date={dateTo} setDate={setDateTo} />
            </div>
            
            {exportType === 'transactions' && <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="failed">Échoué</SelectItem>
                  </SelectContent>
                </Select>
              </div>}
            
            <div className="space-y-2">
              <Label>Utilisateur (ID)</Label>
              <Input placeholder="ID utilisateur..." value={filterUser} onChange={e => setFilterUser(e.target.value)} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            Les exports seront téléchargés automatiquement
          </div>
          
          <Button onClick={handleExport} disabled={!exportType || isExporting} className="flex items-center gap-2">
            {isExporting ? <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Export en cours...
              </> : <>
                <Download className="w-4 h-4" />
                Exporter
              </>}
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default AdminExportManager;