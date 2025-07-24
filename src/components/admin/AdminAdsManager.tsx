import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
const AdminAdsManager = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    seller_id: '',
    target_url: '',
    is_active: true,
    start_date: '',
    end_date: ''
  });
  useEffect(() => {
    loadAds();
    loadSellers();
  }, []);
  const loadAds = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('ads').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error loading ads:', error);
      toast.error("خطأ في تحميل الإعلانات");
    } finally {
      setIsLoading(false);
    }
  };
  const loadSellers = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('id, name').eq('role', 'seller');
      if (error) throw error;
      setSellers(data || []);
    } catch (error) {
      console.error('Error loading sellers:', error);
    }
  };
  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      seller_id: '',
      target_url: '',
      is_active: true,
      start_date: '',
      end_date: ''
    });
    setEditingAd(null);
  };
  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      seller_id: ad.seller_id || '',
      target_url: ad.target_url || '',
      is_active: ad.is_active,
      start_date: ad.start_date ? ad.start_date.split('T')[0] : '',
      end_date: ad.end_date ? ad.end_date.split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };
  const handleSave = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const adData = {
        title: formData.title,
        image_url: formData.image_url,
        seller_id: formData.seller_id || null,
        target_url: formData.target_url || null,
        is_active: formData.is_active,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        created_by: user.id
      };
      if (editingAd) {
        const {
          error
        } = await supabase.from('ads').update(adData).eq('id', editingAd.id);
        if (error) throw error;
        toast.success("تم تحديث الإعلان بنجاح");
      } else {
        const {
          error
        } = await supabase.from('ads').insert(adData);
        if (error) throw error;
        toast.success("تم إنشاء الإعلان بنجاح");
      }
      setIsDialogOpen(false);
      resetForm();
      loadAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error("خطأ في حفظ الإعلان");
    }
  };
  const handleDelete = async (adId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      const {
        error
      } = await supabase.from('ads').delete().eq('id', adId);
      if (error) throw error;
      toast.success("تم حذف الإعلان بنجاح");
      loadAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error("خطأ في حذف الإعلان");
    }
  };
  const toggleAdStatus = async (adId: string, currentStatus: boolean) => {
    try {
      const {
        error
      } = await supabase.from('ads').update({
        is_active: !currentStatus
      }).eq('id', adId);
      if (error) throw error;
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الإعلان`);
      loadAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      toast.error("خطأ في تحديث حالة الإعلان");
    }
  };
  if (isLoading) {
    return <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>;
  }
  return <Card className="my-[183px]">
      <CardHeader className="py-0">
        <div className="flex justify-between items-center">
          <CardTitle>إدارة الإعلانات</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة إعلان جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان الإعلان</Label>
                  <Input id="title" value={formData.title} onChange={e => setFormData({
                  ...formData,
                  title: e.target.value
                })} placeholder="أدخل عنوان الإعلان" />
                </div>

                <div>
                  <Label htmlFor="image_url">رابط الصورة</Label>
                  <Input id="image_url" value={formData.image_url} onChange={e => setFormData({
                  ...formData,
                  image_url: e.target.value
                })} placeholder="أدخل رابط الصورة" />
                </div>

                <div>
                  <Label htmlFor="seller">البائع (اختياري)</Label>
                  <Select value={formData.seller_id} onValueChange={value => setFormData({
                  ...formData,
                  seller_id: value
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر البائع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون بائع محدد</SelectItem>
                      {sellers.map(seller => <SelectItem key={seller.id} value={seller.id}>
                          {seller.name || 'بائع بدون اسم'}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_url">رابط الهدف (اختياري)</Label>
                  <Input id="target_url" value={formData.target_url} onChange={e => setFormData({
                  ...formData,
                  target_url: e.target.value
                })} placeholder="أدخل رابط الهدف" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">تاريخ البداية (اختياري)</Label>
                    <Input id="start_date" type="date" value={formData.start_date} onChange={e => setFormData({
                    ...formData,
                    start_date: e.target.value
                  })} />
                  </div>
                  <div>
                    <Label htmlFor="end_date">تاريخ النهاية (اختياري)</Label>
                    <Input id="end_date" type="date" value={formData.end_date} onChange={e => setFormData({
                    ...formData,
                    end_date: e.target.value
                  })} />
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch checked={formData.is_active} onCheckedChange={checked => setFormData({
                  ...formData,
                  is_active: checked
                })} />
                  <Label>فعال</Label>
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="my-[51px]">
        {ads.length === 0 ? <div className="text-center py-8">
            <p className="text-gray-500">لا توجد إعلانات حالياً</p>
          </div> : <div className="space-y-4">
            {ads.map(ad => <div key={ad.id} className="border rounded-lg p-4 py-0 px-0">
                <div className="flex items-center justify-between my-[11px]">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <img src={ad.image_url} alt={ad.title} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-semibold text-center">{ad.title}</h3>
                      <p className="text-sm text-gray-500 text-center">
                        {new Date(ad.created_at).toLocaleDateString('ar-SA')}
                      </p>
                      <div className="flex items-center space-x-2 space-x-reverse mt-1">
                        <Badge variant={ad.is_active ? "default" : "secondary"}>
                          {ad.is_active ? 'فعال' : 'غير فعال'}
                        </Badge>
                        {ad.seller_id && <Badge variant="outline" className="px-0 py-[17px]">مرتبط ببائع</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="outline" size="sm" onClick={() => toggleAdStatus(ad.id, ad.is_active)} className="text-center">
                      {ad.is_active ? 'إلغاء تفعيل' : 'تفعيل'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(ad)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(ad.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>)}
          </div>}
      </CardContent>
    </Card>;
};
export default AdminAdsManager;