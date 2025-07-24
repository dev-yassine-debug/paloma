
import React from 'react';
import { WelcomeHeader } from '@/components/admin/WelcomeHeader';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeHeader />
      
      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              النشاط الحديث
            </CardTitle>
            <CardDescription>آخر الأنشطة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">منتج جديد تمت إضافته</p>
                  <p className="text-xs text-gray-500">منذ 5 دقائق</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">مستخدم جديد سجل</p>
                  <p className="text-xs text-gray-500">منذ 12 دقيقة</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">طلب جديد في الانتظار</p>
                  <p className="text-xs text-gray-500">منذ 18 دقيقة</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              إحصائيات سريعة
            </CardTitle>
            <CardDescription>نظرة عامة على الأداء</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">معدل النمو الشهري</span>
              <Badge variant="default" className="bg-green-100 text-green-800">+12.5%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">متوسط قيمة الطلب</span>
              <Badge variant="outline">85.50 ريال</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">معدل الموافقة على المنتجات</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">89%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}