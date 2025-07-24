
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancialData } from "@/hooks/useFinancialData";
import FinancialOverview from "./FinancialOverview";
import TransactionManager from "./TransactionManager";
import WalletAnalytics from "./WalletAnalytics";
import AdminWalletStatistics from "./AdminWalletStatistics";
import AdminUserWalletManager from "./AdminUserWalletManager";
import AdminTransactionHistory from "./AdminTransactionHistory";
import FinancialDashboard from "./FinancialDashboard";
import { Loader2 } from "lucide-react";

const AdminFinancialDashboard = () => {
  const { data: financialData, loading, error } = useFinancialData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">جاري تحميل البيانات المالية...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        خطأ في تحميل البيانات المالية: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
          <TabsTrigger value="wallets">المحافظ</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <FinancialOverview financialData={financialData} />
        </TabsContent>
        
        <TabsContent value="transactions">
          <AdminTransactionHistory />
        </TabsContent>
        
        <TabsContent value="wallets">
          <AdminWalletStatistics />
        </TabsContent>
        
        <TabsContent value="analytics">
          <WalletAnalytics financialData={financialData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFinancialDashboard;
