import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/index";
import { Package } from "lucide-react";
import AdminProductActions from "@/components/admin/AdminProductActions";
interface AdminProductsManagementProps {
  allProducts: Product[];
  onUpdate: () => void;
}
const AdminProductsManagement = ({
  allProducts,
  onUpdate
}: AdminProductsManagementProps) => {
  return <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm py-0 mx-0 px-[3px]">
      <CardHeader className="py-0 my-0 mx-0">
        <CardTitle className="text-lg md:text-xl text-center my-[23px]">إدارة المنتجات</CardTitle>
        <CardDescription className="text-base text-center">جميع المنتجات في النظام ({allProducts.length})</CardDescription>
      </CardHeader>
      <CardContent>
        {allProducts.length === 0 ? <div className="text-center py-8 md:py-12">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-sm md:text-base text-gray-600">لم يتم إضافة منتجات بعد</p>
          </div> : <div className="space-y-3 md:space-y-4">
            {allProducts.map(product => <div key={product.id} className="border border-gray-200 rounded-lg p-3 md:p-4 py-0 px-0">
                <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-4">
                  <div className="flex gap-3 md:gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-4 h-4 md:w-6 md:h-6 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base truncate">{product.name}</h4>
                      <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                        <span className="font-semibold text-emerald-600">{product.price} ر.س</span>
                        {product.type === 'product' && <span>الكمية: {product.quantity}</span>}
                        {product.type === 'service' && <span>خدمة: {product.duration_hours}ساعة</span>}
                        <span className="truncate">البائع: {product.profiles?.name || product.profiles?.phone || 'غير محدد'}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${product.status === 'approved' ? 'bg-green-100 text-green-800' : product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {product.status === 'approved' ? 'مقبول' : product.status === 'pending' ? 'معلق' : 'مرفوض'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <AdminProductActions product={product} onUpdate={onUpdate} />
                  </div>
                </div>
              </div>)}
          </div>}
      </CardContent>
    </Card>;
};
export default AdminProductsManagement;