import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, UserX } from "lucide-react";
interface AdminUserActionsProps {
  user: any;
  onUpdate: () => void;
}
const AdminUserActions = ({
  user,
  onUpdate
}: AdminUserActionsProps) => {
  const handleBanUser = async () => {
    try {
      // Update user role to banned or disable account
      const {
        error
      } = await supabase.from('profiles').update({
        role: 'banned'
      }).eq('id', user.id);
      if (error) throw error;
      toast.success("تم حظر المستخدم بنجاح");
      onUpdate();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error("خطأ في حظر المستخدم");
    }
  };
  const handleDeleteUser = async () => {
    try {
      // Delete user profile (this will cascade to related data)
      const {
        error
      } = await supabase.from('profiles').delete().eq('id', user.id);
      if (error) throw error;
      toast.success("تم حذف المستخدم بنجاح");
      onUpdate();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("خطأ في حذف المستخدم");
    }
  };
  return <div className="flex gap-2">
      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'seller' ? 'secondary' : user.role === 'banned' ? 'destructive' : 'outline'}>
        {user.role === 'admin' ? 'مدير' : user.role === 'seller' ? 'بائع' : user.role === 'client' ? 'عميل' : user.role === 'banned' ? 'محظور' : user.role}
      </Badge>
      
      {user.role !== 'admin' && user.role !== 'banned' && <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <UserX className="w-4 h-4 ml-1" />
              حظر
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد حظر المستخدم</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حظر المستخدم {user.name || user.phone}؟ سيتم منعه من الوصول للتطبيق.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleBanUser} className="bg-red-500 hover:bg-red-600">
                حظر المستخدم
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>}

      {user.role !== 'admin' && <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="mx-0 px-0 py-[19px] my-0 text-left font-extralight">
              <Trash2 className="w-4 h-4 ml-1" />
              حذف
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد حذف المستخدم</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف المستخدم {user.name || user.phone}؟ سيتم حذف جميع بياناته نهائياً.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
                حذف نهائي
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>}
    </div>;
};
export default AdminUserActions;