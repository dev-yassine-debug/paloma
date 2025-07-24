import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Crown, ShoppingCart } from "lucide-react";
import AdminUserActions from "./AdminUserActions";

interface AdminUsersManagementProps {
  sellers: any[];
  onUpdate: () => Promise<void>;
}

const AdminUsersManagement = ({ sellers, onUpdate }: AdminUsersManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const clients = sellers.filter((user) => user.role === "client");
  const actualSellers = sellers.filter((user) => user.role === "seller");
  const admins = sellers.filter((user) => user.role === "admin");

  const filteredUsers = (users: any[]) =>
    users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const renderUserTable = (users: any[]) => {
    return (
      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="w-full table-auto text-sm text-right">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100">
            <tr>
              <th className="p-2">الاسم</th>
              <th className="p-2">رقم الهاتف</th>
              <th className="p-2">الدور</th>
              <th className="p-2">المدينة</th>
              <th className="p-2">تاريخ التسجيل</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="p-2 font-medium">
                  {user.name || "مستخدم غير معروف"}
                </td>
                <td className="p-2">{user.phone || "-"}</td>
                <td className="p-2">
                  <Badge variant={
                    user.role === "admin"
                      ? "default"
                      : user.role === "seller"
                      ? "secondary"
                      : user.role === "banned"
                      ? "destructive"
                      : "outline"
                  }>
                    {user.role === "admin"
                      ? "مدير"
                      : user.role === "seller"
                      ? "بائع"
                      : user.role === "client"
                      ? "عميل"
                      : "غير معروف"}
                  </Badge>
                </td>
                <td className="p-2">{user.city || "غير محددة"}</td>
                <td className="p-2">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("ar-SA")
                    : "غير معروف"}
                </td>
                <td className="p-2">
                  <Badge variant={user.role === "banned" ? "destructive" : "outline"}>
                    {user.role === "banned" ? "محظور" : "نشط"}
                  </Badge>
                </td>
                <td className="p-2">
                  <AdminUserActions user={user} onUpdate={onUpdate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-6 text-center text-gray-500">لا يوجد مستخدمين لعرضهم</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
        <div className="relative w-64">
          <Search className="absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي البائعين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actualSellers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">عدد المديرين</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs by role */}
      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-orange-200">
          <TabsTrigger value="clients">العملاء ({clients.length})</TabsTrigger>
          <TabsTrigger value="sellers">البائعين ({actualSellers.length})</TabsTrigger>
          <TabsTrigger value="admins">المديرين ({admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">{renderUserTable(filteredUsers(clients))}</TabsContent>
        <TabsContent value="sellers">{renderUserTable(filteredUsers(actualSellers))}</TabsContent>
        <TabsContent value="admins">{renderUserTable(filteredUsers(admins))}</TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsersManagement;
