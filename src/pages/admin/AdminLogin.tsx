
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEnhancedSession } from '@/hooks/useEnhancedSession';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useEnhancedSession();

  // إعادة توجيه إذا كان المستخدم مصرح له بالفعل
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/analytics');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setIsLoading(true);

    try {
      // محاولة تسجيل الدخول
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('فشل في تسجيل الدخول');
      }

      // التحقق من دور المستخدم
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error('فشل في التحقق من الصلاحيات');
      }

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('ليس لديك صلاحية للوصول إلى لوحة الإدارة');
      }

      // تسجيل حدث الأمان
      await supabase.rpc('log_security_event', {
        p_user_id: data.user.id,
        p_action: 'admin_login_success',
        p_resource_type: 'authentication',
        p_details: { email, timestamp: new Date().toISOString() },
        p_severity: 'info'
      });

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin/analytics');

    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      
      // تسجيل محاولة تسجيل دخول فاشلة
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action: 'admin_login_failed',
        p_resource_type: 'authentication',
        p_details: { 
          email, 
          error: error.message,
          timestamp: new Date().toISOString() 
        },
        p_severity: 'medium'
      });

      if (error.message.includes('Invalid login credentials')) {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        toast.error(error.message || 'حدث خطأ في تسجيل الدخول');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* شعار وعنوان */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">سوق محلي</h1>
            <p className="text-gray-600 mt-2">لوحة إدارة النظام</p>
          </div>

          {/* نموذج تسجيل الدخول */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="admin@souqlocal.sa"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin ml-2" size={20} />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* تحذير أمني */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-yellow-600 mt-0.5 ml-2" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">تنبيه أمني</p>
                <p>جميع محاولات تسجيل الدخول مراقبة ومسجلة لأغراض الأمان.</p>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>محمي بنظام الأمان المتقدم</p>
          <p className="mt-1">© ٢٠٢٤ سوق محلي. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
