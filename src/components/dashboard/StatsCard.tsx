import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-l-4 border-l-yellow-500';
      case 'danger':
        return 'border-l-4 border-l-destructive';
      case 'success':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'danger':
        return 'text-destructive bg-destructive/10';
      case 'success':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  return (
    <Card className={getVariantStyles()}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${getIconStyles()}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-500' : 'text-destructive'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from yesterday
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
