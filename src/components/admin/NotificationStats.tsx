
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Users, TrendingUp, Clock } from "lucide-react";

const NotificationStats = () => {
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadCount: 0,
    todayCount: 0,
    userCounts: {
      client: 0,
      seller: 0,
      admin: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Total notifications
      const { count: totalNotifications } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

      // Unread count
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      // Today's notifications
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // User counts by role
      const { data: users } = await supabase
        .from('profiles')
        .select('role');

      const userCounts = {
        client: 0,
        seller: 0,
        admin: 0
      };

      users?.forEach(user => {
        if (user.role in userCounts) {
          userCounts[user.role as keyof typeof userCounts]++;
        }
      });

      setStats({
        totalNotifications: totalNotifications || 0,
        unreadCount: unreadCount || 0,
        todayCount: todayCount || 0,
        userCounts
      });
    } catch (error) {
      console.error('Error loading notification stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'إجمالي الإشعارات',
      value: stats.totalNotifications.toLocaleString('ar-SA'),
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'غير مقروءة',
      value: stats.unreadCount.toLocaleString('ar-SA'),
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'اليوم',
      value: stats.todayCount.toLocaleString('ar-SA'),
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'إجمالي المستخدمين',
      value: (stats.userCounts.client + stats.userCounts.seller + stats.userCounts.admin).toLocaleString('ar-SA'),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">العملاء</span>
              <span className="text-sm text-gray-600">
                {stats.userCounts.client.toLocaleString('ar-SA')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">البائعين</span>
              <span className="text-sm text-gray-600">
                {stats.userCounts.seller.toLocaleString('ar-SA')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">المديرين</span>
              <span className="text-sm text-gray-600">
                {stats.userCounts.admin.toLocaleString('ar-SA')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationStats;
