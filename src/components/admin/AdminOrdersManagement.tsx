
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  Calendar,
  User,
  Phone,
  CreditCard,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { Order } from "@/types";
import { useAdminSession } from "@/hooks/useAdminSession";
import { formatCurrency, formatDate } from "@/utils/numberUtils";

const AdminOrdersManagement = () => {
  const { isAuthenticated, handleSessionExpired } = useAdminSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchOrders, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        handleSessionExpired();
        return;
      }

      console.log('Fetching orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(name, price),
          buyer_profile:profiles!buyer_id(id, name, phone),
          seller_profile:profiles!seller_id(id, name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        if (error.message.includes('JWT')) {
          handleSessionExpired();
          return;
        }
        throw error;
      }

      console.log('Raw orders data from Supabase:', data);

      const transformedOrders: Order[] = (data || []).map(order => {
        console.log('Processing order:', order.id, 'Raw data:', order);

        const buyerProfiles = order.buyer_profile as Array<{
          id: string;
          name: string;
          phone: string;
        }> | {
          id: string;
          name: string;
          phone: string;
        } | null;

        const sellerProfiles = order.seller_profile as Array<{
          id: string;
          name: string;
          phone: string;
        }> | {
          id: string;
          name: string;
          phone: string;
        } | null;

        return {
          id: order.id,
          buyer_id: order.buyer_id,
          seller_id: order.seller_id,
          product_id: order.product_id,
          quantity: order.quantity,
          total_amount: order.total_amount,
          original_amount: order.original_amount,
          commission: order.commission,
          admin_commission: order.admin_commission,
          cashback: order.cashback,
          status: order.status || 'pending',
          payment_method: order.payment_method,
          payment_status: (order as any).payment_status || 'pending',
          delivery_status: (order as any).delivery_status || 'pending',
          delivery_confirmation_date: (order as any).delivery_confirmation_date,
          rejection_reason: (order as any).rejection_reason,
          type: (order.type === 'service' ? 'service' : 'product') as 'product' | 'service',
          service_date: order.service_date,
          service_time: order.service_time,
          created_at: order.created_at,
          updated_at: order.updated_at,
          products: order.products ? {
            name: order.products.name,
            price: order.products.price
          } : undefined,
          buyer_profile: Array.isArray(buyerProfiles) && buyerProfiles.length > 0 ? {
            id: buyerProfiles[0].id,
            name: buyerProfiles[0].name,
            phone: buyerProfiles[0].phone
          } : buyerProfiles && !Array.isArray(buyerProfiles) ? {
            id: buyerProfiles.id,
            name: buyerProfiles.name,
            phone: buyerProfiles.phone
          } : undefined,
          seller_profile: Array.isArray(sellerProfiles) && sellerProfiles.length > 0 ? {
            id: sellerProfiles[0].id,
            name: sellerProfiles[0].name,
            phone: sellerProfiles[0].phone
          } : sellerProfiles && !Array.isArray(sellerProfiles) ? {
            id: sellerProfiles.id,
            name: sellerProfiles.name,
            phone: sellerProfiles.phone
          } : undefined
        };
      });

      console.log('Transformed orders:', transformedOrders);
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("خطأ في تحميل الطلبات");
    }
    setLoading(false);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.seller_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(order => order.payment_method === paymentFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "في الانتظار", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      completed: { label: "مكتمل", className: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { label: "ملغي", className: "bg-red-100 text-red-800 border-red-200" },
      delivered: { label: "تم التسليم", className: "bg-blue-100 text-blue-800 border-blue-200" }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      className: "bg-gray-100 text-gray-800 border-gray-200" 
    };
    
    return (
      <Badge className={`${statusInfo.className} border font-medium`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'delivered': return <Package className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-royal-dark mb-2">جلسة منتهية</h3>
          <p className="text-gray-600">يرجى تسجيل الدخول مرة أخرى</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-green mx-auto mb-4"></div>
          <p className="text-royal-dark font-medium">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  return (
    <div dir="rtl" className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-royal-dark">إدارة الطلبات</h1>
          <p className="text-gray-600 mt-1">إدارة ومتابعة جميع الطلبات في النظام</p>
        </div>
        <Button onClick={fetchOrders} className="royal-button flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث البيانات
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="royal-card border-l-4 border-l-royal-green">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-royal-dark">{totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-royal-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="royal-card border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="royal-card border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">مكتملة</p>
                <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="royal-card border-l-4 border-l-royal-gold">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-royal-gold">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-royal-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="royal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-royal-dark">
            <Filter className="w-5 h-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
                <SelectItem value="delivered">تم التسليم</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطرق</SelectItem>
                <SelectItem value="wallet">المحفظة</SelectItem>
                <SelectItem value="cash">نقدي</SelectItem>
                <SelectItem value="card">بطاقة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="royal-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status || 'pending')}
                  <div>
                    <CardTitle className="text-lg text-royal-dark">
                      طلب #{order.id.slice(-8)}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {order.created_at ? formatDate(order.created_at) : 'غير محدد'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(order.status || 'pending')}
                  {order.payment_status && getStatusBadge(order.payment_status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product Info */}
                <div className="space-y-3 p-4 bg-gradient-to-br from-royal-muted/30 to-royal-cream/30 rounded-lg border border-royal-border">
                  <h4 className="font-semibold text-royal-dark flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    تفاصيل المنتج
                  </h4>
                  <div className="space-y-2">
                    <p className="font-medium text-royal-dark">{order.products?.name || 'غير محدد'}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">الكمية:</span>
                      <span className="font-medium">{order.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">السعر:</span>
                      <span className="font-medium">{formatCurrency(order.products?.price || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">النوع:</span>
                      <span className="font-medium">{order.type === 'service' ? 'خدمة' : 'منتج'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Buyer Info */}
                <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    المشتري
                  </h4>
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900">{order.buyer_profile?.name || 'غير محدد'}</p>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Phone className="w-4 h-4" />
                      {order.buyer_profile?.phone || 'غير محدد'}
                    </div>
                  </div>
                </div>
                
                {/* Seller Info */}
                <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    البائع
                  </h4>
                  <div className="space-y-2">
                    <p className="font-medium text-green-900">{order.seller_profile?.name || 'غير محدد'}</p>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Phone className="w-4 h-4" />
                      {order.seller_profile?.phone || 'غير محدد'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-r from-royal-gold/10 to-royal-green/10 p-4 rounded-lg border border-royal-border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <span className="block text-gray-600 mb-1">المبلغ الإجمالي</span>
                    <p className="font-bold text-lg text-royal-green">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-600 mb-1">العمولة</span>
                    <p className="font-semibold text-royal-gold">{formatCurrency(order.commission || 0)}</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-600 mb-1">الكاشباك</span>
                    <p className="font-semibold text-purple-600">{formatCurrency(order.cashback || 0)}</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      طريقة الدفع
                    </span>
                    <p className="font-semibold">
                      {order.payment_method === 'wallet' ? 'المحفظة' : order.payment_method || 'غير محدد'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(order.delivery_confirmation_date || order.rejection_reason || (order.type === 'service' && order.service_date)) && (
                <div className="bg-gray-50 p-4 rounded-lg border text-sm space-y-2">
                  {order.delivery_confirmation_date && (
                    <p><span className="font-medium">تاريخ تأكيد الاستلام:</span> {formatDate(order.delivery_confirmation_date)}</p>
                  )}
                  {order.rejection_reason && (
                    <p className="text-red-600"><span className="font-medium">سبب الرفض:</span> {order.rejection_reason}</p>
                  )}
                  {order.type === 'service' && order.service_date && (
                    <p><span className="font-medium">تاريخ الخدمة:</span> {formatDate(order.service_date)}</p>
                  )}
                  {order.type === 'service' && order.service_time && (
                    <p><span className="font-medium">وقت الخدمة:</span> {order.service_time}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="royal-card">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-royal-dark mb-2">لا توجد طلبات</h3>
            <p className="text-gray-600">لم يتم العثور على أي طلبات تطابق معايير البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminOrdersManagement;
