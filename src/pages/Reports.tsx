import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSales, getProducts } from '@/utils/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart3,
  Download,
  TrendingUp,
  Package,
  Clock
} from 'lucide-react';
import { format, parseISO, differenceInDays, subDays, isWithinInterval } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(45, 93%, 47%)', 'hsl(0, 84%, 60%)', 'hsl(280, 65%, 60%)'];

const Reports: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('sales');

  const sales = getSales();
  const products = getProducts();
  const today = new Date();

  // Sales by category
  const salesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const current = categoryMap.get(product.category) || 0;
          categoryMap.set(product.category, current + item.total);
        }
      });
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name: t(name as any),
      value,
    }));
  }, [sales, products, t]);

  // Sales trend (last 7 days)
  const salesTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const daySales = sales.filter(sale => {
        const saleDate = parseISO(sale.createdAt);
        return isWithinInterval(saleDate, { start: dayStart, end: dayEnd });
      });
      
      return {
        date: format(subDays(today, 6 - i), 'EEE'),
        revenue: daySales.reduce((sum, s) => sum + s.total, 0),
        count: daySales.length,
      };
    });
  }, [sales, today]);

  // Expiring products report
  const expiringProducts = useMemo(() => {
    return products
      .filter(p => p.expiryDate)
      .map(p => ({
        ...p,
        daysUntilExpiry: differenceInDays(parseISO(p.expiryDate!), today),
      }))
      .filter(p => p.daysUntilExpiry <= 30)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [products, today]);

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => p.quantity <= p.minStockLevel)
      .sort((a, b) => a.quantity - b.quantity);
  }, [products]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalTransactions = sales.length;

  const exportReport = (type: string) => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'sales':
        data = sales.map(s => ({
          Date: format(parseISO(s.createdAt), 'yyyy-MM-dd HH:mm'),
          Items: s.items.length,
          Total: s.total,
          Payment: s.paymentMethod,
          Reference: s.mpesaRef || '-',
        }));
        filename = 'sales-report.json';
        break;
      case 'inventory':
        data = products.map(p => ({
          Name: p.name,
          SKU: p.sku,
          Category: p.category,
          Quantity: p.quantity,
          MinStock: p.minStockLevel,
          BuyingPrice: p.buyingPrice,
          SellingPrice: p.sellingPrice,
          ExpiryDate: p.expiryDate || '-',
        }));
        filename = 'inventory-report.json';
        break;
      case 'expiry':
        data = expiringProducts.map(p => ({
          Name: p.name,
          SKU: p.sku,
          Quantity: p.quantity,
          ExpiryDate: format(parseISO(p.expiryDate!), 'yyyy-MM-dd'),
          DaysLeft: p.daysUntilExpiry,
        }));
        filename = 'expiry-report.json';
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('reports')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="sales" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('salesReport')}
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2">
                <Package className="h-4 w-4" />
                {t('inventoryReport')}
              </TabsTrigger>
              <TabsTrigger value="expiry" className="gap-2">
                <Clock className="h-4 w-4" />
                {t('expiryReport')}
              </TabsTrigger>
            </TabsList>

            {/* Sales Report */}
            <TabsContent value="sales" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('todayRevenue')}</p>
                    <p className="text-2xl font-bold">{t('ksh')} {totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{language === 'sw' ? 'Jumla Miamala' : 'Total Transactions'}</p>
                    <p className="text-2xl font-bold">{totalTransactions}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => exportReport('sales')}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('exportReport')}
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{language === 'sw' ? 'Mwenendo wa Mauzo' : 'Sales Trend'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesTrend}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                            }}
                            formatter={(value: number) => [`KSh ${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{language === 'sw' ? 'Mauzo kwa Aina' : 'Sales by Category'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesByCategory}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {salesByCategory.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `KSh ${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Inventory Report */}
            <TabsContent value="inventory" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="text-base px-4 py-2">
                  {lowStockProducts.length} {language === 'sw' ? 'bidhaa chache' : 'low stock items'}
                </Badge>
                <Button variant="outline" onClick={() => exportReport('inventory')}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('exportReport')}
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('productName')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead className="text-right">{t('quantity')}</TableHead>
                      <TableHead className="text-right">{t('minStockLevel')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {language === 'sw' ? product.nameSwahili : product.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{t(product.category)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">{product.minStockLevel}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{language === 'sw' ? 'Chache' : 'Low'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Expiry Report */}
            <TabsContent value="expiry" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="text-base px-4 py-2">
                  {expiringProducts.length} {language === 'sw' ? 'bidhaa zinazoisha' : 'expiring items'}
                </Badge>
                <Button variant="outline" onClick={() => exportReport('expiry')}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('exportReport')}
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('productName')}</TableHead>
                      <TableHead>{t('batchNumber')}</TableHead>
                      <TableHead className="text-right">{t('quantity')}</TableHead>
                      <TableHead>{t('expiryDate')}</TableHead>
                      <TableHead>{language === 'sw' ? 'Siku Zilizobaki' : 'Days Left'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {language === 'sw' ? product.nameSwahili : product.name}
                        </TableCell>
                        <TableCell>{product.batchNumber}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell>
                          {format(parseISO(product.expiryDate!), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.daysUntilExpiry <= 7 ? 'destructive' : 'secondary'}
                          >
                            {product.daysUntilExpiry} {language === 'sw' ? 'siku' : 'days'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
