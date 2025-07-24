import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, ArrowUpRight, ArrowDownLeft } from "lucide-react";
interface TransactionManagerProps {
  transactions: any[];
  onRefresh: () => void;
}
const TransactionManager = ({
  transactions,
  onRefresh
}: TransactionManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const getTransactionIcon = (type: string, amount: number) => {
    if (type.includes('recharge') || type.includes('cashback') || amount > 0) {
      return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
    }
    return <ArrowUpRight className="w-4 h-4 text-red-600" />;
  };
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
    return <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>;
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
    return <Badge variant="outline" className="text-xs">
        {typeLabels[type] || type}
      </Badge>;
  };
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.profiles?.phone?.includes(searchTerm) || transaction.description_ar?.toLowerCase().includes(searchTerm.toLowerCase()) || transaction.id.includes(searchTerm);
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
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
  const transactionTypes = [...new Set(transactions.map(t => t.type))];
  const transactionStatuses = [...new Set(transactions.map(t => t.status))];
  return <div className="space-y-6">
      <Card>
        
        
      </Card>
    </div>;
};
export default TransactionManager;