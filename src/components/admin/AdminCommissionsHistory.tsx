
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, DollarSign, TrendingUp, Users, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Commission {
  id: string;
  order_id: string;
  product_price: number;
  commission: number;
  cashback: number;
  admin_gain: number;
  total_paid: number;
  created_at: string;
  buyer_id: string;
  seller_id: string;
  buyer_name?: string;
  seller_name?: string;
  buyer_phone?: string;
  seller_phone?: string;
  order_total?: number;
  product_name?: string;
  product_category?: string;
  commission_rate?: number;
  status?: string;
}

interface CommissionStats {
  total_commissions: number;
  total_cashback: number;
  total_admin_gain: number;
  transactions_count: number;
}

export const AdminCommissionsHistory = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionStats>({
    total_commissions: 0,
    total_cashback: 0,
    total_admin_gain: 0,
    transactions_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCommissions();
  }, [timeFilter]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      
      // Use the consolidated commissions_history table with manual joins
      let query = supabase
        .from('commissions_history')
        .select(`
          *,
          buyer:buyer_id(name, phone),
          seller:seller_id(name, phone),
          order:order_id(
            total_amount,
            product:product_id(name, category)
          )
        `);

      // Apply time filter
      if (timeFilter !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (timeFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Commission interface
      const transformedData: Commission[] = (data || []).map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        product_price: item.product_price,
        commission: item.commission,
        cashback: item.cashback,
        admin_gain: item.admin_gain,
        total_paid: item.total_paid,
        created_at: item.created_at,
        buyer_id: item.buyer_id,
        seller_id: item.seller_id,
        buyer_name: item.buyer?.name,
        buyer_phone: item.buyer?.phone,
        seller_name: item.seller?.name,
        seller_phone: item.seller?.phone,
        order_total: item.order?.total_amount,
        product_name: item.order?.product?.name,
        product_category: item.order?.product?.category,
        status: 'completed'
      }));

      setCommissions(transformedData);

      // Calculate stats
      const totalCommissions = transformedData.reduce((sum, c) => sum + (c.commission || 0), 0);
      const totalCashback = transformedData.reduce((sum, c) => sum + (c.cashback || 0), 0);
      const totalAdminGain = transformedData.reduce((sum, c) => sum + (c.admin_gain || 0), 0);

      setStats({
        total_commissions: totalCommissions,
        total_cashback: totalCashback,
        total_admin_gain: totalAdminGain,
        transactions_count: transformedData.length
      });

    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommissions = commissions.filter(commission =>
    commission.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commission.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commission.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commission.order_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCommissions = filteredCommissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي العمولات</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.total_commissions.toFixed(2)} ر.س
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الكاش باك</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total_cashback.toFixed(2)} ر.س
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ربح الإدارة</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.total_admin_gain.toFixed(2)} ر.س
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد المعاملات</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.transactions_count}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>تاريخ العمولات والكاش باك</span>
            <Button onClick={fetchCommissions} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ابحث بالمشتري أو البائع أو المنتج أو رقم الطلب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="اختر الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأوقات</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-right p-3 font-semibold">رقم الطلب</th>
                  <th className="text-right p-3 font-semibold">المنتج</th>
                  <th className="text-right p-3 font-semibold">المشتري</th>
                  <th className="text-right p-3 font-semibold">البائع</th>
                  <th className="text-right p-3 font-semibold">سعر المنتج</th>
                  <th className="text-right p-3 font-semibold">العمولة</th>
                  <th className="text-right p-3 font-semibold">الكاش باك</th>
                  <th className="text-right p-3 font-semibold">ربح الإدارة</th>
                  <th className="text-right p-3 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCommissions.map((commission) => (
                  <tr key={commission.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className="font-mono text-sm">
                        {commission.order_id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-sm">{commission.product_name || 'غير محدد'}</div>
                        <div className="text-xs text-gray-500">{commission.product_category}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-sm">{commission.buyer_name || 'غير محدد'}</div>
                        <div className="text-xs text-gray-500">{commission.buyer_phone}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-sm">{commission.seller_name || 'غير محدد'}</div>
                        <div className="text-xs text-gray-500">{commission.seller_phone}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold">
                        {commission.product_price?.toFixed(2) || '0.00'} ر.س
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-green-100 text-green-800">
                        +{commission.commission?.toFixed(2) || '0.00'} ر.س
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        -{commission.cashback?.toFixed(2) || '0.00'} ر.س
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-purple-100 text-purple-800">
                        +{commission.admin_gain?.toFixed(2) || '0.00'} ر.س
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {format(new Date(commission.created_at), 'dd MMM yyyy', { locale: ar })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                عرض {(currentPage - 1) * itemsPerPage + 1} إلى {Math.min(currentPage * itemsPerPage, filteredCommissions.length)} من {filteredCommissions.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
