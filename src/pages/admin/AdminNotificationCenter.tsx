
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminNotificationManager from "@/components/admin/AdminNotificationManager";

const AdminNotificationCenter = () => {
  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">مركز الإشعارات</h1>
        <p className="text-gray-600 mt-2">إدارة وإرسال الإشعارات للمستخدمين</p>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            إدارة الإشعارات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-4">
          <AdminNotificationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNotificationCenter;
