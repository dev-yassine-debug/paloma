import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkAdminUser = async () => {
      try {
        console.log('[AdminLogin] Vérification de la session...');
        // Petit délai pour éviter session fantôme après logout
        await new Promise(res => setTimeout(res, 100));
        
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AdminLogin] Erreur getSession:', error);
          toast.error('خطأ في الاتصال أثناء التحقق من الجلسة.');
          return;
        }

        const session = data?.session;
        console.log('[AdminLogin] Session récupérée:', session);

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError || !profile) {
            console.warn('[AdminLogin] Pas de rôle trouvé ou erreur:', profileError);
            return;
          }

          if (profile.role === 'admin') {
            toast.success('أنت بالفعل متصل كمسؤول.');
            navigate('/admin/analytics');
            return;
          }
        }
      } catch (err) {
        console.error('[AdminLogin] Erreur inattendue:', err);
        toast.error('حدث خطأ غير متوقع أثناء التحقق من الجلسة.');
      } finally {
        setCheckingSession(false); // 🔥 toujours débloquer
      }
    };

    checkAdminUser();
  }, [navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    setIsLoading(true);
    try {
      const emailToUse = `admin_${username}@souqlocal.system`;
      console.log('[AdminLogin] Connexion avec:', emailToUse);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
      });

      if (error || !data.user) {
        toast.error('فشل تسجيل الدخول: ' + (error?.message ?? 'المستخدم غير موجود.'));
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        toast.error('غير مخول للوصول');
        return;
      }

      toast.success("مرحباً بك في لوحة الإدارة");
      navigate('/admin/analytics');
    } catch (err) {
      console.error('[AdminLogin] Erreur:', err);
      toast.error('حدث خطأ غير متوقع أثناء تسجيل الدخول.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-6 h-6 text-green-700" /> دخول الإدارة</CardTitle>
          <CardDescription>تسجيل الدخول إلى لوحة تحكم الإدارة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} autoFocus autoComplete="username" />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                <button type="button" className="absolute inset-y-0 end-0 px-2 flex items-center" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
