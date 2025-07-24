
import AdminTransactionHistory from "@/components/admin/AdminTransactionHistory";
import TransactionManager from "@/components/admin/TransactionManager";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const AdminTransactions = () => {
  const { data: financialData, loading, error, refetch } = useFinancialData();

  console.log('📊 AdminTransactions - Data state:', {
    loading,
    error,
    transactionsCount: financialData?.transactions?.length || 0,
    hasData: !!financialData
  });

  const handleDebugRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    toast.info("Actualisation des données...");
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p>Chargement des transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">Erreur: {error}</p>
            <Button onClick={handleDebugRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المعاملات</h1>
          <p className="text-gray-600 mt-1">
            عرض وإدارة جميع المعاملات المالية 
            {financialData?.transactions && (
              <span className="font-semibold">
                ({financialData.transactions.length} معاملة)
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleDebugRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          تحديث
        </Button>
      </div>

      {/* Debug Info - Only show if no transactions */}
      {financialData && financialData.transactions.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-yellow-800 font-medium">
                لا توجد معاملات في قاعدة البيانات
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                إذا كان من المفترض وجود معاملات، تأكد من أن البيانات يتم حفظها بشكل صحيح في جدول payment_transactions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Transaction History Component */}
      <AdminTransactionHistory />

      {/* Additional Transaction Manager for Advanced Operations */}
      {financialData && financialData.transactions && (
        <TransactionManager 
          transactions={financialData.transactions} 
          onRefresh={refetch}
        />
      )}
    </div>
  );
};

export default AdminTransactions;
