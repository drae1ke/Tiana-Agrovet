import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardStats } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useApi';
import LowStockAlert from '@/components/dashboard/LowStockAlert';
import ExpiryAlert from '@/components/dashboard/ExpiryAlert';
import SalesChart from '@/components/dashboard/SalesChart';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO, isToday, format } from 'date-fns';
import {
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShoppingCart,
  Plus,
  BarChart3,
  ArrowRight,
  Leaf,
  Droplets,
  Bug,
  Syringe,
  Wrench,
  DollarSign,
  Activity,
  RefreshCw,
} from 'lucide-react';

const categoryConfig = {
  seeds: { icon: Leaf, color: '#166534', bg: '#dcfce7', label: 'Seeds' },
  fertilizers: { icon: Droplets, color: '#0e7490', bg: '#cffafe', label: 'Fertilizers' },
  pesticides: { icon: Bug, color: '#9a3412', bg: '#ffedd5', label: 'Pesticides' },
  veterinary: { icon: Syringe, color: '#6b21a8', bg: '#f3e8ff', label: 'Veterinary' },
  tools: { icon: Wrench, color: '#374151', bg: '#f3f4f6', label: 'Tools' },
} as const;

const Dashboard: React.FC = () => {
  const { t } = useLanguage();

  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 200 });
  const { data: salesData, isLoading: salesLoading } = useSales({ limit: 500 });

  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  const sales = useMemo(() => salesData?.data ?? [], [salesData?.data]);

  const stats = useMemo<DashboardStats & { categoryBreakdown: Record<string, number>; yesterdayRevenue: number; weekRevenue: number }>(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lowStockCount = products.filter(p => p.quantity <= p.minStockLevel).length;
    const expiringCount = products.filter(p => {
      if (!p.expiryDate) return false;
      const daysUntil = differenceInDays(parseISO(p.expiryDate), today);
      return daysUntil <= 30 && daysUntil >= 0;
    }).length;

    const todaySalesData = sales.filter(s => isToday(parseISO(s.createdAt)));
    const todayRevenue = todaySalesData.reduce((sum, s) => sum + s.total, 0);

    const yesterdaySales = sales.filter(s => {
      const d = parseISO(s.createdAt);
      return d.toDateString() === yesterday.toDateString();
    });
    const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + s.total, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const weekRevenue = sales
      .filter(s => parseISO(s.createdAt) >= weekAgo)
      .reduce((sum, s) => sum + s.total, 0);

    const categoryBreakdown: Record<string, number> = {};
    products.forEach(p => {
      categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
    });

    return {
      totalProducts: products.length,
      lowStockItems: lowStockCount,
      expiringItems: expiringCount,
      todaySales: todaySalesData.length,
      todayRevenue,
      yesterdayRevenue,
      weekRevenue,
      categoryBreakdown,
    };
  }, [products, sales]);

  const revenueChange = stats.yesterdayRevenue > 0
    ? Math.round(((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100)
    : null;

  const isLoading = productsLoading || salesLoading;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#0f172a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{t('loading')}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/pos">
            <Button style={{ gap: '6px', height: '36px', fontSize: '13px' }}>
              <ShoppingCart size={15} />
              New Sale
            </Button>
          </Link>
          <Link to="/inventory">
            <Button variant="outline" style={{ gap: '6px', height: '36px', fontSize: '13px' }}>
              <Plus size={15} />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Revenue card */}
        <div style={{ background: '#0f172a', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '20px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Today's Revenue</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
            KSh {stats.todayRevenue.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            {revenueChange !== null ? (
              <span style={{ color: revenueChange >= 0 ? '#4ade80' : '#f87171', background: revenueChange >= 0 ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', padding: '2px 8px', borderRadius: '999px', fontWeight: 500 }}>
                {revenueChange >= 0 ? '+' : ''}{revenueChange}% vs yesterday
              </span>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>No data yesterday</span>
            )}
          </div>
        </div>

        {/* Sales count */}
        <div style={{ background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="#16a34a" />
            </div>
            <span style={{ fontSize: '11px', color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '999px', fontWeight: 500 }}>Live</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.todaySales}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Transactions today</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            7-day total: <strong style={{ color: 'var(--color-text-primary)' }}>KSh {stats.weekRevenue.toLocaleString()}</strong>
          </div>
        </div>

        {/* Total products */}
        <div style={{ background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Package size={16} color="#2563eb" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.totalProducts}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Total products</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {Object.entries(stats.categoryBreakdown).map(([cat, count]) => {
              const cfg = categoryConfig[cat as keyof typeof categoryConfig];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: cfg.color, background: cfg.bg, padding: '2px 7px', borderRadius: '999px' }}>
                  <Icon size={10} />{count}
                </span>
              );
            })}
          </div>
        </div>

        {/* Low stock */}
        <div style={{ background: stats.lowStockItems > 0 ? '#fffbeb' : 'var(--color-background-primary)', border: `1px solid ${stats.lowStockItems > 0 ? '#fde68a' : 'var(--color-border-tertiary)'}`, borderRadius: 'var(--border-radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: stats.lowStockItems > 0 ? '#fef3c7' : 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color={stats.lowStockItems > 0 ? '#d97706' : 'var(--color-text-secondary)'} />
            </div>
            {stats.lowStockItems > 0 && (
              <span style={{ fontSize: '11px', color: '#92400e', background: '#fef3c7', padding: '3px 8px', borderRadius: '999px', fontWeight: 600 }}>Needs attention</span>
            )}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: stats.lowStockItems > 0 ? '#92400e' : 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.lowStockItems}</div>
          <div style={{ fontSize: '12px', color: stats.lowStockItems > 0 ? '#92400e' : 'var(--color-text-secondary)', marginBottom: '8px' }}>Low stock items</div>
          {stats.lowStockItems > 0 && (
            <Link to="/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#d97706', textDecoration: 'none', fontWeight: 500 }}>
              View all <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {/* Expiring */}
        <div style={{ background: stats.expiringItems > 0 ? '#fff1f2' : 'var(--color-background-primary)', border: `1px solid ${stats.expiringItems > 0 ? '#fecdd3' : 'var(--color-border-tertiary)'}`, borderRadius: 'var(--border-radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: stats.expiringItems > 0 ? '#ffe4e6' : 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color={stats.expiringItems > 0 ? '#dc2626' : 'var(--color-text-secondary)'} />
            </div>
            {stats.expiringItems > 0 && (
              <span style={{ fontSize: '11px', color: '#991b1b', background: '#ffe4e6', padding: '3px 8px', borderRadius: '999px', fontWeight: 600 }}>Urgent</span>
            )}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: stats.expiringItems > 0 ? '#991b1b' : 'var(--color-text-primary)', marginBottom: '4px' }}>{stats.expiringItems}</div>
          <div style={{ fontSize: '12px', color: stats.expiringItems > 0 ? '#991b1b' : 'var(--color-text-secondary)', marginBottom: '8px' }}>Expiring in 30d</div>
          {stats.expiringItems > 0 && (
            <Link to="/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#dc2626', textDecoration: 'none', fontWeight: 500 }}>
              View report <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Quick Actions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { to: '/pos', icon: ShoppingCart, label: 'New Sale', primary: true },
            { to: '/inventory', icon: Plus, label: 'Add Product', primary: false },
            { to: '/orders', icon: RefreshCw, label: 'Restock Order', primary: false },
            { to: '/reports', icon: BarChart3, label: 'View Reports', primary: false },
            { to: '/suppliers', icon: TrendingUp, label: 'Manage Suppliers', primary: false },
          ].map(({ to, icon: Icon, label, primary }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px',
                background: primary ? '#0f172a' : 'var(--color-background-secondary)',
                color: primary ? '#fff' : 'var(--color-text-primary)',
                border: primary ? 'none' : '1px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
                <Icon size={14} />
                {label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts and Alerts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem', alignItems: 'start' }}>
        <div style={{ background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Sales Trend</div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'var(--color-background-secondary)', padding: '3px 10px', borderRadius: '999px' }}>Last 7 days</span>
          </div>
          <div style={{ padding: '1rem' }}>
            <SalesChart />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Category breakdown mini card */}
          <div style={{ background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>By Category</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(categoryConfig).map(([key, cfg]) => {
                const count = stats.categoryBreakdown[key] || 0;
                const pct = stats.totalProducts > 0 ? (count / stats.totalProducts) * 100 : 0;
                const Icon = cfg.icon;
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                        <Icon size={13} color={cfg.color} />{cfg.label}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{count}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--color-border-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <LowStockAlert />
          <ExpiryAlert />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
