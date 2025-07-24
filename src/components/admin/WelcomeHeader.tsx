
import React from 'react';
import { useEnhancedSession } from '@/hooks/useEnhancedSession';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export const WelcomeHeader = () => {
  const { user } = useEnhancedSession();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg mb-6">
      <CardContent className="p-6">
        <div className="flex items-center space-x-reverse space-x-3">
          <Sparkles className="w-8 h-8 text-yellow-300" />
          <div>
            <h1 className="text-2xl font-bold">
              👋 {getGreeting()}، مرحباً بك في لوحة الإدارة
            </h1>
            <p className="text-blue-100 mt-1">
              {getCurrentDate()} - إليك إحصائيات اليوم
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
