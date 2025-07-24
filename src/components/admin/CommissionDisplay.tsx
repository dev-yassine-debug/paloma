
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";

interface CommissionDisplayProps {
  data: {
    totalCommissions: number;
    totalCashbacks: number;
    adminGain: number;
    transactionsCount: number;
  };
}

const CommissionDisplay = ({ data }: CommissionDisplayProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي العمولات</p>
              <p className="text-2xl font-bold text-green-600">
                {data.totalCommissions.toFixed(2)} ر.س
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الكاش باك</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.totalCashbacks.toFixed(2)} ر.س
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ربح الإدارة</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.adminGain.toFixed(2)} ر.س
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عدد المعاملات</p>
              <p className="text-2xl font-bold text-gray-600">
                {data.transactionsCount}
              </p>
            </div>
            <Users className="h-8 w-8 text-gray-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionDisplay;
