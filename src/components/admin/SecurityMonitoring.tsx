
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/utils/arabic-formatters';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Filter, 
  RefreshCw,
  Download,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from './LoadingSpinner';

interface SecurityEvent {
  id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: any;
  severity: string;
  created_at: string;
}

export const SecurityMonitoring = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    severity: 'all',
    action: '',
    dateRange: '24h'
  });

  const loadSecurityEvents = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('security_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter.severity !== 'all') {
        query = query.eq('severity', filter.severity);
      }

      if (filter.action) {
        query = query.ilike('action', `%${filter.action}%`);
      }

      // فلترة حسب التاريخ
      const now = new Date();
      let dateFrom: Date;
      
      switch (filter.dateRange) {
        case '1h':
          dateFrom = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      query = query.gte('created_at', dateFrom.toISOString());

      const { data, error } = await query;

      if (error) throw error;

      // تحويل البيانات مع معالجة ip_address
      const transformedEvents: SecurityEvent[] = (data || []).map(event => ({
        ...event,
        ip_address: event.ip_address ? String(event.ip_address) : undefined
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('خطأ في تحميل أحداث الأمان:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityEvents();
  }, [filter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      critical: 'حرجة',
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
      info: 'معلوماتي'
    };
    return labels[severity] || severity;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'admin_login': 'تسجيل دخول مشرف',
      'admin_logout': 'تسجيل خروج مشرف',
      'product_validation': 'التحقق من منتج',
      'user_created': 'إنشاء مستخدم',
      'unauthorized_access': 'محاولة وصول غير مخول',
      'token_refreshed': 'تحديث الرمز المميز',
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return <LoadingSpinner message="جاري تحميل أحداث الأمان..." />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Shield className="ml-3 h-8 w-8 text-blue-600" />
            مراقبة الأمان
          </h1>
          <p className="text-gray-600 mt-1">مراقبة الأنشطة الأمنية وأحداث النظام</p>
        </div>
        
        <div className="flex items-center space-x-reverse space-x-4">
          <button
            onClick={loadSecurityEvents}
            className="flex items-center space-x-reverse space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>تحديث</span>
            <RefreshCw size={16} />
          </button>
          
          <button className="flex items-center space-x-reverse space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span>تصدير</span>
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="ml-2 h-5 w-5" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مستوى الخطورة</label>
              <select
                value={filter.severity}
                onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع المستويات</option>
                <option value="critical">حرجة</option>
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
                <option value="info">معلوماتي</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع النشاط</label>
              <input
                type="text"
                value={filter.action}
                onChange={(e) => setFilter(prev => ({ ...prev, action: e.target.value }))}
                placeholder="ابحث في الأنشطة..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفترة الزمنية</label>
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">آخر ساعة</option>
                <option value="24h">آخر ٢٤ ساعة</option>
                <option value="7d">آخر أسبوع</option>
                <option value="30d">آخر شهر</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الأحداث */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الأحداث الأمنية ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">لا توجد أحداث أمنية في الفترة المحددة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-reverse space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                          {getSeverityLabel(event.severity)}
                        </span>
                        <span className="font-medium text-gray-800">
                          {getActionLabel(event.action)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.created_at)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {event.resource_type && (
                          <p>نوع المورد: {event.resource_type}</p>
                        )}
                        {event.ip_address && (
                          <p>عنوان IP: {event.ip_address}</p>
                        )}
                        {event.details && Object.keys(event.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              عرض التفاصيل
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(event.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    
                    <AlertTriangle 
                      className={`h-5 w-5 ${
                        event.severity === 'critical' ? 'text-red-500' :
                        event.severity === 'high' ? 'text-orange-500' :
                        event.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
