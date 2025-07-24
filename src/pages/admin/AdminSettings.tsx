
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataSeeder from "@/components/admin/DataSeeder";

const AdminSettings = () => {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إعدادات النظام</h1>
        <p className="text-gray-600 mt-2">إدارة إعدادات التطبيق والبيانات</p>
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data">البيانات</TabsTrigger>
          <TabsTrigger value="system">النظام</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data" className="space-y-4">
          <DataSeeder />
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-500">إعدادات النظام قريباً...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-500">إعدادات الإشعارات قريباً...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
