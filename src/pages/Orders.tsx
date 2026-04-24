import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PurchaseOrder, OrderStatus, OrderItem } from '@/types';
import { useOrders, useUpdateOrderStatus, useTriggerAutoCheck, useSuppliers } from '@/hooks/useApi';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ClipboardList,
  Check,
  X,
  PackageCheck,
  Zap,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Orders: React.FC = () => {
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showOrderDetails, setShowOrderDetails] = useState<PurchaseOrder | null>(null);

  const { data: ordersData, isLoading: ordersLoading } = useOrders({ limit: 200 });
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({ limit: 100 });
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 200 });
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const triggerAutoCheckMutation = useTriggerAutoCheck();

  // Ensure data is always an array
  const orders = ordersData?.data || [];
  const suppliers = suppliersData?.data || [];
  const products = productsData?.data || [];

  const filteredOrders = orders.filter(o => 
    statusFilter === 'all' || o.status === statusFilter
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = (order: PurchaseOrder, newStatus: OrderStatus) => {
    updateOrderStatusMutation.mutate(
      { id: order.id, status: newStatus },
      {
        onSuccess: () => {
          setShowOrderDetails(null);
        }
      }
    );
  };

  const handleCheckAutoOrders = () => {
    triggerAutoCheckMutation.mutate();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('pending')}</Badge>;
      case 'ordered':
        return <Badge className="bg-blue-500 hover:bg-blue-600">{t('ordered')}</Badge>;
      case 'received':
        return <Badge className="bg-green-500 hover:bg-green-600">{t('received')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('cancelled')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const isLoading = ordersLoading || suppliersLoading || productsLoading;

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
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t('purchaseOrders')}
          </CardTitle>
          <Button variant="outline" onClick={handleCheckAutoOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'sw' ? 'Angalia Bidhaa Chache' : 'Check Low Stock'}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filter */}
          <div className="mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('orderStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'sw' ? 'Zote' : 'All'}</SelectItem>
                <SelectItem value="pending">{t('pending')}</SelectItem>
                <SelectItem value="ordered">{t('ordered')}</SelectItem>
                <SelectItem value="received">{t('received')}</SelectItem>
                <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'sw' ? 'Nambari' : 'Order #'}</TableHead>
                  <TableHead>{t('supplier')}</TableHead>
                  <TableHead>{t('items')}</TableHead>
                  <TableHead className="text-right">{t('amount')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        {order._id.slice(0, 8).toUpperCase()}
                        {order.isAutoGenerated && (
                          <Zap className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{order.items.length} {t('items')}</TableCell>
                    <TableCell className="text-right">
                      {t('ksh')} {order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {format(parseISO(order.createdAt), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOrderDetails(order)}
                      >
                        {t('view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t('noResults')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={!!showOrderDetails} onOpenChange={() => setShowOrderDetails(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {language === 'sw' ? 'Maelezo ya Agizo' : 'Order Details'}
              {showOrderDetails?.isAutoGenerated && (
                <Badge className="bg-yellow-500">
                  <Zap className="h-3 w-3 mr-1" />
                  {t('autoGenerated')}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              #{showOrderDetails?._id.slice(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          
          {showOrderDetails && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('supplier')}</p>
                <p className="font-medium">{showOrderDetails.supplierName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('items')}</p>
                <div className="space-y-2">
                  {showOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm p-2 bg-muted rounded">
                      <span>{item.productName} × {item.quantity}</span>
                      <span>{t('ksh')} {(item.quantity * item.unitPrice).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between font-bold pt-2 border-t">
                <span>{t('total')}</span>
                <span>{t('ksh')} {showOrderDetails.totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('status')}</span>
                {getStatusBadge(showOrderDetails.status)}
              </div>

              {showOrderDetails.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => handleStatusChange(showOrderDetails, 'ordered')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {t('confirmOrder')}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleStatusChange(showOrderDetails, 'cancelled')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {showOrderDetails.status === 'ordered' && (
                <Button 
                  className="w-full"
                  onClick={() => handleStatusChange(showOrderDetails, 'received')}
                >
                  <PackageCheck className="h-4 w-4 mr-2" />
                  {t('markReceived')}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
