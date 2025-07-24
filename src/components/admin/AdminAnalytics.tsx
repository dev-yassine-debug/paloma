
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStats } from "@/types/index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminAnalyticsProps {
  stats: AdminStats | null;
}

const AdminAnalytics = ({ stats }: AdminAnalyticsProps) => {
  // Handle loading state when stats is null
  if (!stats) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="text-center">نظرة عامة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    {
      name: 'المستخدمون',
      total: stats.totalUsers
    },
    {
      name: 'البائعون',
      total: stats.totalSellers
    },
    {
      name: 'العملاء',
      total: stats.totalClients
    },
    {
      name: 'المنتجات',
      total: stats.totalProducts
    },
    {
      name: 'الطلبات',
      total: stats.totalOrders
    }
  ];

  return (
    <Card className="col-span-4">
      <CardHeader className="py-6">
        <CardTitle className="text-center">نظرة عامة</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AdminAnalytics;
