
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Bell, Users, AlertCircle } from "lucide-react";

const AdminNotificationManager = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetRole, setTargetRole] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadRecentNotifications();
  }, []);

  const loadRecentNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          type,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq(targetRole === 'all' ? 'id' : 'role', targetRole === 'all' ? undefined : targetRole);

      if (profilesError) throw profilesError;

      const notifications = profiles?.map(profile => ({
        user_id: profile.id,
        title,
        message,
        type,
      })) || [];

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: "تم الإرسال",
        description: `تم إرسال الإشعار إلى ${notifications.length} مستخدم`,
      });

      setTitle('');
      setMessage('');
      setType('info');
      setTargetRole('all');
      loadRecentNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الإشعار",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (notificationType: string) => {
    switch (notificationType) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">إدارة الإشعارات</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              إرسال إشعار جديد
            </CardTitle>
            <CardDescription>
              إرسال إشعار إلى المستخدمين
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">العنوان</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الإشعار"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الرسالة</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="محتوى الإشعار"
                rows={4}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">نوع الإشعار</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">معلومات</SelectItem>
                    <SelectItem value="success">نجح</SelectItem>
                    <SelectItem value="warning">تحذير</SelectItem>
                    <SelectItem value="error">خطأ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المستهدف</label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستخدمين</SelectItem>
                    <SelectItem value="client">العملاء</SelectItem>
                    <SelectItem value="seller">البائعين</SelectItem>
                    <SelectItem value="admin">المديرين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={sendNotification}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال الإشعار'}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              الإشعارات الأخيرة
            </CardTitle>
            <CardDescription>
              آخر 10 إشعارات تم إرسالها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border rounded-lg p-3 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getTypeIcon(notification.type)}
                      </span>
                      <h4 className="font-medium text-sm">
                        {notification.title}
                      </h4>
                    </div>
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleString('ar-SA')}
                  </p>
                </div>
              ))}
              {recentNotifications.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  لا توجد إشعارات
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminNotificationManager;
