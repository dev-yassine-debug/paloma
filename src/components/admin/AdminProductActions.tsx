
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminProductActionsProps {
  product: any;
  onUpdate: () => void;
}

const AdminProductActions = ({ product, onUpdate }: AdminProductActionsProps) => {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleVisibility = async () => {
    setIsToggling(true);
    try {
      const newStatus = product.status === 'approved' ? 'rejected' : 'approved';
      
      // Utiliser l'edge function pour une validation robuste
      const { data, error } = await supabase.functions.invoke('approve-product', {
        body: { 
          productId: product.id, 
          action: newStatus === 'approved' ? 'approve' : 'reject',
          adminId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success(
        newStatus === 'approved' 
          ? `تم قبول ${product.type === 'service' ? 'الخدمة' : 'المنتج'} بنجاح` 
          : `تم رفض ${product.type === 'service' ? 'الخدمة' : 'المنتج'}`
      );
      
      // Refresh the data
      onUpdate();
    } catch (error) {
      console.error('Error updating product visibility:', error);
      toast.error(`خطأ في تحديث ${product.type === 'service' ? 'الخدمة' : 'المنتج'}`);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast.success(`تم حذف ${product.type === 'service' ? 'الخدمة' : 'المنتج'} بنجاح`);
      onUpdate();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`خطأ في حذف ${product.type === 'service' ? 'الخدمة' : 'المنتج'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusText = () => {
    const itemType = product.type === 'service' ? 'الخدمة' : 'المنتج';
    return product.status === 'approved' ? `إخفاء ${itemType}` : `إظهار ${itemType}`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleVisibility}
        disabled={isToggling}
        title={getStatusText()}
        className="text-xs"
      >
        {isToggling ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
        ) : product.status === 'approved' ? (
          <>
            <EyeOff className="w-3 h-3 ml-1" />
            <span className="hidden sm:inline">إخفاء</span>
          </>
        ) : (
          <>
            <Eye className="w-3 h-3 ml-1" />
            <span className="hidden sm:inline">إظهار</span>
          </>
        )}
      </Button>

      <Button variant="outline" size="sm" title="تعديل" className="text-xs">
        <Edit className="w-3 h-3 ml-1" />
        <span className="hidden sm:inline">تعديل</span>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="sm" 
            title={`حذف ${product.type === 'service' ? 'الخدمة' : 'المنتج'}`}
            className="text-xs"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              تأكيد حذف {product.type === 'service' ? 'الخدمة' : 'المنتج'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف {product.type === 'service' ? 'خدمة' : 'منتج'} "{product.name}"؟
              <br />
              <strong>هذا الإجراء لا يمكن التراجع عنه.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف {product.type === 'service' ? 'الخدمة' : 'المنتج'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProductActions;
