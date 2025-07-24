import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/numberUtils';
interface RoyalStatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  type?: 'currency' | 'number' | 'percentage';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  className?: string;
}
const RoyalStatsCard: React.FC<RoyalStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  type = 'number',
  trend,
  className = ''
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    switch (type) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `٪${formatNumber(val, 1)}`;
      default:
        return formatNumber(val);
    }
  };
  return <Card className={`royal-card hover:shadow-royal transition-all duration-300 border-royal-border ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="font-medium text-royal-dark/80 mx-0 text-xl">
          {title}
        </CardTitle>
        <div className="w-10 h-10 rounded-full bg-royal-green/10 flex items-center justify-center mx-0">
          <Icon className="h-5 w-5 text-royal-green" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-royal-dark mb-2 number-display">
          {formatValue(value)}
        </div>
        {trend && <div className={`flex items-center text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend.direction === 'up' ? <TrendingUp className="w-4 h-4 ml-1" /> : <TrendingDown className="w-4 h-4 ml-1" />}
            <span className="number-display">٪{formatNumber(trend.value, 1)}</span>
            <span className="mr-2">{trend.label}</span>
          </div>}
      </CardContent>
    </Card>;
};
export default RoyalStatsCard;