import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check, X, Search, Filter, Package, Wrench, Clock, Calendar, MapPin, User, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/index";
interface AdminPendingProductsProps {
  pendingProducts: Product[];
  productUpdates: any[];
  onProductAction: (productId: string, action: 'approve' | 'reject') => Promise<void>;
  onUpdateAction: (updateId: string, action: 'approve' | 'reject') => Promise<void>;
}
const AdminPendingProducts = ({
  pendingProducts,
  productUpdates,
  onProductAction,
  onUpdateAction
}: AdminPendingProductsProps) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  useEffect(() => {
    filterProducts();
  }, [pendingProducts, searchQuery, statusFilter, typeFilter, categoryFilter]);
  const filterProducts = () => {
    let filtered = [...pendingProducts];
    if (searchQuery) {
      filtered = filtered.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || product.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || product.category?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter);
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter(product => (product.type || 'product') === typeFilter);
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    setFilteredProducts(filtered);
  };
  const handleProductAction = async (productId: string, action: 'approve' | 'reject') => {
    setProcessingId(productId);
    try {
      await onProductAction(productId, action);
      const actionText = action === 'approve' ? 'قبول' : 'رفض';
      toast.success(`تم ${actionText} العنصر بنجاح`);
    } catch (error) {
      console.error(`Error ${action}ing product:`, error);
      const actionText = action === 'approve' ? 'قبول' : 'رفض';
      toast.error(`خطأ في ${actionText} العنصر`);
    } finally {
      setProcessingId(null);
    }
  };
  const handleDeleteProduct = async (productId: string) => {
    setDeletingId(productId);
    try {
      const {
        error
      } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      toast.success("تم حذف العنصر بنجاح");
      // Trigger a refresh of the parent data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("خطأ في حذف العنصر");
    } finally {
      setDeletingId(null);
    }
  };
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: {
        label: "في الانتظار",
        color: "bg-yellow-100 text-yellow-800"
      },
      approved: {
        label: "مقبول",
        color: "bg-green-100 text-green-800"
      },
      rejected: {
        label: "مرفوض",
        color: "bg-red-100 text-red-800"
      }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };
  const getTypeBadge = (type: string, product: Product) => {
    const typeMap = {
      product: {
        label: "منتج",
        icon: Package,
        color: "bg-blue-100 text-blue-800"
      },
      service: {
        label: "خدمة",
        icon: Wrench,
        color: "bg-purple-100 text-purple-800"
      }
    };
    const typeInfo = typeMap[type as keyof typeof typeMap] || typeMap.product;
    const Icon = typeInfo.icon;
    return <Badge className={`${typeInfo.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {typeInfo.label}
        {type === 'service' && product.duration_hours && <span className="ml-1">({product.duration_hours}h)</span>}
      </Badge>;
  };
  const formatServiceDetails = (product: Product) => {
    if (product.type !== 'service') return null;
    const days = product.available_days || [];
    return <div className="mt-2 p-2 bg-purple-50 rounded border">
        <h4 className="text-sm font-medium text-purple-800 mb-1">تفاصيل الخدمة:</h4>
        
        {product.duration_hours && <div className="flex items-center gap-1 text-xs text-purple-600">
            <Clock className="w-3 h-3" />
            <span>المدة: {product.duration_hours} ساعة</span>
          </div>}
        
        {days.length > 0 && <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
            <Calendar className="w-3 h-3" />
            <span>الأيام: {days.join(', ')}</span>
          </div>}
        
        {product.start_time && product.end_time && <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
            <Clock className="w-3 h-3" />
            <span>الوقت: {product.start_time} - {product.end_time}</span>
          </div>}
      </div>;
  };
  const getUniqueCategories = () => {
    const categories = pendingProducts.map(p => p.category).filter(Boolean).filter((value, index, self) => self.indexOf(value) === index);
    return categories;
  };
  const getProductStats = () => {
    const total = pendingProducts.length;
    const pending = pendingProducts.filter(p => p.status === 'pending').length;
    const approved = pendingProducts.filter(p => p.status === 'approved').length;
    const rejected = pendingProducts.filter(p => p.status === 'rejected').length;
    const productsCount = pendingProducts.filter(p => (p.type || 'product') === 'product').length;
    const servicesCount = pendingProducts.filter(p => p.type === 'service').length;
    return {
      total,
      pending,
      approved,
      rejected,
      productsCount,
      servicesCount
    };
  };
  const stats = getProductStats();
  return <div className="space-y-6 py-0">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 py-[97px]">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">إجمالي</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">في الانتظار</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-500">مقبول</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-500">مرفوض</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.productsCount}</div>
            <div className="text-sm text-gray-500">منتجات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.servicesCount}</div>
            <div className="text-sm text-gray-500">خدمات</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="البحث في المنتجات..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة التصديق" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="approved">مقبول</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع المحتوى" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="product">منتجات</SelectItem>
                <SelectItem value="service">خدمات</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {getUniqueCategories().map(category => <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => <Card key={product.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                <div className="flex flex-col gap-2">
                  {getStatusBadge(product.status || 'pending')}
                  {getTypeBadge(product.type || 'product', product)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover rounded-md" />}
                
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg text-green-600">
                    {Number(product.price).toFixed(2)} ر.س
                  </p>
                  
                  {product.type === 'product' && <div className="text-sm text-gray-500">
                      الكمية: {product.quantity}
                    </div>}
                </div>

                {formatServiceDetails(product)}
                
                {product.category && <Badge variant="outline">{product.category}</Badge>}

                {/* Seller Info */}
                {product.profiles && <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <User className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{product.profiles.name || 'غير محدد'}</div>
                      {product.profiles.city && <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3" />
                          {product.profiles.city}
                        </div>}
                    </div>
                  </div>}
                
                <div className="text-xs text-gray-500">
                  تاريخ الإنشاء: {new Date(product.created_at || '').toLocaleDateString('ar-SA')}
                </div>
                
                <Separator />
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleProductAction(product.id, 'approve')} disabled={processingId === product.id || product.status === 'approved'} className="flex-1">
                    {processingId === product.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div> : <Check className="w-4 h-4" />}
                    قبول
                  </Button>
                  
                  <Button size="sm" variant="outline" onClick={() => handleProductAction(product.id, 'reject')} disabled={processingId === product.id || product.status === 'rejected'} className="flex-1">
                    {processingId === product.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div> : <X className="w-4 h-4" />}
                    رفض
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" disabled={deletingId === product.id}>
                        {deletingId === product.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          تأكيد حذف {product.type === 'service' ? 'الخدمة' : 'المنتج'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف {product.type === 'service' ? 'خدمة' : 'منتج'} "{product.name}"؟ 
                          <br />
                          <strong>هذا الإجراء لا يمكن التراجع عنه وسيؤثر على جميع البيانات المرتبطة.</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-red-600 hover:bg-red-700">
                          حذف نهائياً
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عناصر</h3>
            <p className="text-gray-500">
              {pendingProducts.length === 0 ? "لم يتم إضافة أي منتجات أو خدمات حتى الآن" : "لا توجد عناصر تطابق الفلاتر المحددة"}
            </p>
          </CardContent>
        </Card>}
    </div>;
};
export default AdminPendingProducts;