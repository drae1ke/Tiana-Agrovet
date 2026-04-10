import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSales } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, parseISO, startOfDay, isSameDay } from 'date-fns';

const SalesChart: React.FC = () => {
  const { t } = useLanguage();
  const { data: salesData } = useSales({ limit: 500 });
  
  const sales = salesData?.data || [];

  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);
    
    const daySales = sales.filter(sale => 
      isSameDay(parseISO(sale.createdAt), dayStart)
    );
    
    const total = daySales.reduce((sum, sale) => sum + sale.total, 0);
    
    return {
      date: format(date, 'EEE'),
      sales: total,
      count: daySales.length,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t('recentSales')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                formatter={(value: number) => [`KSh ${value.toLocaleString()}`, 'Sales']}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
