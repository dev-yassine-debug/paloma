
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/numberUtils";
import { Plus, Edit, Trash2, ExternalLink, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ad {
  id: string;
  title: string;
  image_url: string;
  seller_id: string | null;
  target_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface Seller {
  id: string;
  name: string;
  phone: string;
  city: string;
}

const AdminAdsManager = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    seller_id: "",
    target_url: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    loadAds();
    loadSellers();
  }, []);

  const loadAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error: any) {
      toast.error(`خطأ في تحميل الإعلانات: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, phone, city')
        .eq('role', 'seller');

      if (error) throw error;
      setSellers(data || []);
    } catch (error: any) {
      toast.error(`خطأ في تحميل البائعين: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const adData = {
        title: formData.title,
        image_url: formData.image_url,
        seller_id: formData.seller_id || null,
        target_url: formData.target_url || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      let result;
      if (editingAd) {
        result = await supabase
          .from('ads')
          .update(adData)
          .eq('id', editingAd.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('ads')
          .insert(adData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(editingAd ? 'تم تحديث الإعلان بنجاح' : 'تم إنشاء الإعلان بنجاح');
      
      resetForm();
      setIsDialogOpen(false);
      loadAds();
      
    } catch (error: any) {
      toast.error(`خطأ في حفظ الإعلان: ${error.message}`);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      seller_id: ad.seller_id || "",
      target_url: ad.target_url || "",
      start_date: ad.start_date ? ad.start_date.split('T')[0] : "",
      end_date: ad.end_date ? ad.end_date.split('T')[0] : "",
      is_active: ad.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast.success('تم حذف الإعلان بنجاح');
      loadAds();
    } catch (error: any) {
      toast.error(`خطأ في حذف الإعلان: ${error.message}`);
    }
  };

  const toggleAdStatus = async (adId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_active: !currentStatus })
        .eq('id', adId);

      if (error) throw error;

      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الإعلان`);
      loadAds();
    } catch (error: any) {
      toast.error(`خطأ في تغيير حالة الإعلان: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image_url: "",
      seller_id: "",
      target_url: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
    setEditingAd(null);
  };

  const getSeller = (sellerId: string) => {
    return sellers.find(s => s.id === sellerId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الإعلانات</h1>
          <p className="text-gray-600 mt-1">إدارة إعلانات الصفحة الرئيسية والعروض الترويجية</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة إعلان جديد
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان الإعلان</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="image_url">رابط الصورة</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="seller_id">البائع (اختياري)</Label>
                <Select
                  value={formData.seller_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, seller_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر بائع (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون بائع محدد</SelectItem>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.name} - {seller.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="target_url">رابط خارجي (اختياري)</Label>
                <Input
                  id="target_url"
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">تاريخ البداية</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">تاريخ النهاية</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">تفعيل الإعلان</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingAd ? 'تحديث' : 'إنشاء'} الإعلان
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => {
          const seller = ad.seller_id ? getSeller(ad.seller_id) : null;
          
          return (
            <Card key={ad.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={ad.is_active ? "default" : "secondary"}>
                    {ad.is_active ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {ad.title}
                </h3>
                
                {seller && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Store className="w-4 h-4 ml-1" />
                    {seller.name} - {seller.city}
                  </div>
                )}
                
                {ad.target_url && (
                  <div className="flex items-center text-sm text-blue-600 mb-2">
                    <ExternalLink className="w-4 h-4 ml-1" />
                    رابط خارجي
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mb-3">
                  {ad.start_date && `من: ${new Date(ad.start_date).toLocaleDateString('ar-SA')}`}
                  {ad.end_date && ` إلى: ${new Date(ad.end_date).toLocaleDateString('ar-SA')}`}
                  {!ad.start_date && !ad.end_date && 'بدون تاريخ محدد'}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(ad)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                  >
                    {ad.is_active ? 'إلغاء تفعيل' : 'تفعيل'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {ads.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد إعلانات</p>
            <p className="text-gray-400 text-sm mt-2">
              انقر على "إضافة إعلان جديد" لإنشاء إعلان جديد
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAdsManager;
