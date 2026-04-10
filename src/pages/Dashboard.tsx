import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { initializeSeedData } from '@/utils/seedData';
import { DashboardStats } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useApi';
import StatsCard from '@/components/dashboard/StatsCard';
import LowStockAlert from '@/components/dashboard/LowStockAlert';
import ExpiryAlert from '@/components/dashboard/ExpiryAlert';
import SalesChart from '@/components/dashboard/SalesChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO, isToday } from 'date-fns';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  
  // Initialize seed data on first load
  React.useEffect(() => {
    initializeSeedData();
  }, []);

  // Fetch data using React Query hooks
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 200 });
  const { data: salesData, isLoading: salesLoading } = useSales({ limit: 500 });

  // Ensure data is always an array
  const products = productsData?.data || [];
  const sales = salesData?.data || [];

  // Calculate stats
  const stats = useMemo<DashboardStats>(() => {
    const today = new Date();
    
    const lowStockCount = products.filter(p => p.quantity <= p.minStockLevel).length;
    const expiringCount = products.filter(p => {
      if (!p.expiryDate) return false;
      const daysUntil = differenceInDays(parseISO(p.expiryDate), today);
      return daysUntil <= 30 && daysUntil >= 0;
    }).length;
    
    const todaySalesData = sales.filter(s => isToday(parseISO(s.createdAt)));
    const todayRevenue = todaySalesData.reduce((sum, s) => sum + s.total, 0);

    return {
      totalProducts: products.length,
      lowStockItems: lowStockCount,
      expiringItems: expiringCount,
      todaySales: todaySalesData.length,
      todayRevenue,
    };
  }, [products, sales]);

  const isLoading = productsLoading || salesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('totalProducts')}
          value={stats.totalProducts}
          subtitle={t('items')}
          icon={Package}
        />
        <StatsCard
          title={t('lowStockItems')}
          value={stats.lowStockItems}
          subtitle={t('items')}
          icon={AlertTriangle}
          variant={stats.lowStockItems > 0 ? 'warning' : 'default'}
        />
        <StatsCard
          title={t('expiringSoon')}
          value={stats.expiringItems}
          subtitle={t('items')}
          icon={Clock}
          variant={stats.expiringItems > 0 ? 'danger' : 'default'}
        />
        <StatsCard
          title={t('todayRevenue')}
          value={`${t('ksh')} ${stats.todayRevenue.toLocaleString()}`}
          subtitle={`${stats.todaySales} ${t('items')}`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t('quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/pos">
              <Button className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                {t('pos')}
              </Button>
            </Link>
            <Link to="/inventory">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                {t('addProduct')}
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('reports')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalesChart />
        <div className="space-y-4">
          <LowStockAlert />
          <ExpiryAlert />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
