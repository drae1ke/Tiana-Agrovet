import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
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
  Leaf
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const menuItems = [
    { title: t('dashboard'), url: '/', icon: LayoutDashboard },
    { title: t('pos'), url: '/pos', icon: ShoppingCart },
    { title: t('inventory'), url: '/inventory', icon: Package },
    { title: t('suppliers'), url: '/suppliers', icon: Users },
    { title: t('orders'), url: '/orders', icon: ClipboardList },
    { title: t('reports'), url: '/reports', icon: BarChart3 },
    { title: t('settings'), url: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">Tiana</span>
              <span className="text-xs text-sidebar-foreground/70">POS System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{!collapsed && (t('dashboard'))}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2 bg-green-500 hover:bg-green-100 text-white rounded-md px-2 py-1">
                      <item.icon className="h-4 w-4"  />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-4">
          {!collapsed && (
            <p className="text-xs text-sidebar-foreground/50 text-center">
              © {new Date().getFullYear()}  Tiana Agrovet. All rights reserved.
            </p>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
