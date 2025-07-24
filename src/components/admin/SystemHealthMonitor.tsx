
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const SystemHealthMonitor = () => {
  const { data: financialData, loading, refetch } = useFinancialData();
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [issues, setIssues] = useState<Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }>>([]);

  useEffect(() => {
    if (!financialData) return;

    const detectedIssues: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> = [];

    // Vérification du solde admin
    if (financialData.adminWalletBalance < 100) {
      detectedIssues.push({
        type: 'low_balance',
        message: 'رصيد المحفظة الإدارية منخفض جداً (أقل من 100 ر.س)',
        severity: 'high'
      });
    } else if (financialData.adminWalletBalance < 500) {
      detectedIssues.push({
        type: 'low_balance',
        message: 'رصيد المحفظة الإدارية منخفض (أقل من 500 ر.س)',
        severity: 'medium'
      });
    }

    // Vérification de la cohérence des données
    if (financialData.adminTotalCommissions < financialData.adminTotalCashbacks) {
      detectedIssues.push({
        type: 'data_inconsistency',
        message: 'إجمالي الكاشباك أكبر من إجمالي العمولات - خطأ في البيانات',
        severity: 'high'
      });
    }

    // Vérification de la liquidité du système
    const liquidityRatio = financialData.systemHealth?.adminLiquidity || 0;
    if (liquidityRatio < 0.05) {
      detectedIssues.push({
        type: 'liquidity',
        message: 'نسبة السيولة منخفضة جداً - قد يواجه النظام مشاكل في دفع الكاشباك',
        severity: 'high'
      });
    } else if (liquidityRatio < 0.1) {
      detectedIssues.push({
        type: 'liquidity',
        message: 'نسبة السيولة منخفضة - مراقبة مطلوبة',
        severity: 'medium'
      });
    }

    // Déterminer le statut général
    const highSeverityIssues = detectedIssues.filter(issue => issue.severity === 'high');
    const mediumSeverityIssues = detectedIssues.filter(issue => issue.severity === 'medium');

    if (highSeverityIssues.length > 0) {
      setHealthStatus('critical');
    } else if (mediumSeverityIssues.length > 0) {
      setHealthStatus('warning');
    } else {
      setHealthStatus('healthy');
    }

    setIssues(detectedIssues);
  }, [financialData]);

  const getStatusIcon = () => {
    switch (healthStatus) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (healthStatus) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
    }
  };

  const getStatusLabel = () => {
    switch (healthStatus) {
      case 'healthy':
        return 'النظام يعمل بشكل طبيعي';
      case 'warning':
        return 'تحذيرات تتطلب المراقبة';
      case 'critical':
        return 'مشاكل حرجة تتطلب تدخل فوري';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span>حالة النظام</span>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          مراقبة الحالة العامة للنظام المالي
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <span className="font-medium">الحالة العامة</span>
            <Badge variant={healthStatus === 'healthy' ? 'default' : healthStatus === 'warning' ? 'secondary' : 'destructive'}>
              <span className={getStatusColor()}>{getStatusLabel()}</span>
            </Badge>
          </div>

          {issues.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">المشاكل المكتشفة:</h4>
              {issues.map((issue, index) => (
                <Alert key={index} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    {issue.severity === 'high' ? 'تحذير عالي' : 
                     issue.severity === 'medium' ? 'تحذير متوسط' : 'تنبيه'}
                  </AlertTitle>
                  <AlertDescription>{issue.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {financialData && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">رصيد الإدارة</p>
                <p className="text-lg font-bold text-blue-800">
                  {financialData.adminWalletBalance.toFixed(2)} ر.س
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">نسبة السيولة</p>
                <p className="text-lg font-bold text-green-800">
                  {((financialData.systemHealth?.adminLiquidity || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {healthStatus === 'healthy' && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-green-700 text-sm font-medium">
                  جميع الأنظمة تعمل بشكل طبيعي
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthMonitor;
