import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { useAlerts } from '@/hooks/useApi';
import { useProductStats } from '@/hooks/useProducts';

const AppSidebar: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { data: alerts } = useAlerts();
  const { data: productStats } = useProductStats();

  const menuItems = [
    {
      title: t('dashboard'),
      url: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: t('pos'),
      url: '/pos',
      icon: ShoppingCart,
      badge: null,
    },
    {
      title: t('inventory'),
      url: '/inventory',
      icon: Package,
      badge: alerts?.lowStock?.count > 0 ? String(alerts.lowStock.count) : null,
      badgeColor: '#f59e0b',
    },
    {
      title: t('suppliers'),
      url: '/suppliers',
      icon: Users,
      badge: null,
    },
    {
      title: t('orders'),
      url: '/orders',
      icon: ClipboardList,
      badge: null,
    },
    {
      title: t('reports'),
      url: '/reports',
      icon: BarChart3,
      badge: alerts?.expiring?.count > 0 ? String(alerts.expiring.count) : null,
      badgeColor: '#ef4444',
    },
    {
      title: t('settings'),
      url: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: collapsed ? '16px 12px' : '16px',
          transition: 'padding 0.2s',
        }}>
          {/* Logo mark */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(22,163,74,0.35)',
          }}>
            <Leaf size={20} color="#fff" />
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontWeight: 700,
                fontSize: '15px',
                color: 'hsl(var(--sidebar-foreground))',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}>
                Tiana Agrovet
              </div>
              <div style={{
                fontSize: '11px',
                color: 'hsl(var(--sidebar-foreground) / 0.5)',
                whiteSpace: 'nowrap',
              }}>
                POS & Inventory
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent style={{ padding: '8px 0' }}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.url);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <Link
                      to={item.url}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: collapsed ? '10px 12px' : '10px 14px',
                        margin: '2px 8px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        transition: 'all 0.15s',
                        position: 'relative',
                        background: active
                          ? 'linear-gradient(135deg, #16a34a, #15803d)'
                          : 'transparent',
                        boxShadow: active ? '0 2px 8px rgba(22,163,74,0.25)' : 'none',
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'hsl(var(--sidebar-accent))';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon
                          size={18}
                          color={active ? '#fff' : 'hsl(var(--sidebar-foreground) / 0.7)'}
                          strokeWidth={active ? 2.2 : 1.8}
                        />
                      </div>

                      {!collapsed && (
                        <>
                          <span style={{
                            fontSize: '13.5px',
                            fontWeight: active ? 600 : 450,
                            color: active ? '#fff' : 'hsl(var(--sidebar-foreground) / 0.85)',
                            flex: 1,
                            whiteSpace: 'nowrap',
                          }}>
                            {item.title}
                          </span>

                          {item.badge && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              minWidth: '18px',
                              height: '18px',
                              borderRadius: '9px',
                              background: active ? 'rgba(255,255,255,0.25)' : (item.badgeColor || '#6b7280'),
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 5px',
                            }}>
                              {item.badge}
                            </span>
                          )}

                          {active && !item.badge && (
                            <ChevronRight size={14} color="rgba(255,255,255,0.6)" />
                          )}
                        </>
                      )}

                      {/* Collapsed badge dot */}
                      {collapsed && item.badge && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: item.badgeColor || '#6b7280',
                          border: '1.5px solid hsl(var(--sidebar-background))',
                        }} />
                      )}
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick stats in sidebar when expanded */}
        {!collapsed && (
          <div style={{
            margin: '12px 16px 0',
            padding: '12px',
            background: 'hsl(var(--sidebar-accent))',
            borderRadius: '10px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--sidebar-foreground) / 0.5)', marginBottom: '8px' }}>
              At a Glance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'hsl(var(--sidebar-foreground) / 0.7)' }}>Total products</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--sidebar-foreground))' }}>
                  {productStats?.totalProducts ?? '—'}
                </span>
              </div>
              {alerts?.lowStock?.count > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#f59e0b' }}>⚠ Low stock</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>{alerts.lowStock.count}</span>
                </div>
              )}
              {alerts?.expiring?.count > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#ef4444' }}>⏰ Expiring</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>{alerts.expiring.count}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px' }}>
        {!collapsed && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'hsl(var(--sidebar-foreground) / 0.35)', marginBottom: '2px' }}>
              © {new Date().getFullYear()} Tiana Agrovet
            </div>
            <div style={{ fontSize: '10px', color: 'hsl(var(--sidebar-foreground) / 0.25)' }}>
              v1.0.0
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;