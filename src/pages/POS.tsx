import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/hooks/useProducts';
import { useCreateSale } from '@/hooks/useApi';
import { Product } from '@/api/products';
import { Sale } from '@/api/sales';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Smartphone, CheckCircle, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  productId: string;
  name: string;
  nameSwahili: string;
  quantity: number;
  unitPrice: number;
  total: number;
  maxQty: number;
}

const POS: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const { data } = useProducts({ limit: 200 });
  const createSale = useCreateSale();

  const products = (data?.data ?? []).filter((p) => p.quantity > 0);

  const filtered = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameSwahili?.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const cartTotal = cart.reduce((s, i) => s + i.total, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error(language === 'sw' ? 'Bidhaa haipatikani' : 'Not enough stock');
          return prev;
        }
        return prev.map((i) =>
          i.productId === product._id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          nameSwahili: product.nameSwahili,
          quantity: 1,
          unitPrice: product.sellingPrice,
          total: product.sellingPrice,
          maxQty: product.quantity,
        },
      ];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const newQty = i.quantity + delta;
          if (newQty <= 0) return { ...i, quantity: 0 };
          if (newQty > i.maxQty) {
            toast.error(language === 'sw' ? 'Bidhaa haipatikani' : 'Not enough stock');
            return i;
          }
          return { ...i, quantity: newQty, total: newQty * i.unitPrice };
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const processPayment = async () => {
    if (paymentMethod === 'mpesa' && !customerPhone) {
      toast.error(language === 'sw' ? 'Ingiza nambari ya simu' : 'Enter phone number');
      return;
    }
    try {
      const sale = await createSale.mutateAsync({
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        customerPhone: paymentMethod === 'mpesa' ? customerPhone : undefined,
      });
      setLastSale(sale);
      setShowPayment(false);
      setShowReceipt(true);
      toast.success(t('paymentSuccessful'));
    } catch {
      // error toast handled by mutation
    }
  };

  const newSale = () => {
    setCart([]);
    setCustomerPhone('');
    setPaymentMethod('cash');
    setShowReceipt(false);
    setLastSale(null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3 h-[calc(100vh-8rem)]">
      {/* Products */}
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('searchProducts')} value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <Card key={p._id} className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => addToCart(p)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="text-xs">{t(p.category)}</Badge>
                      <Badge variant="outline" className="text-xs">{p.quantity} {language === 'sw' ? 'zilizo' : 'in stock'}</Badge>
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                      {language === 'sw' ? p.nameSwahili : p.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">SKU: {p.sku}</p>
                    <p className="font-bold text-primary">{t('ksh')} {p.sellingPrice.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">{t('noResults')}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div className="flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />{t('cart')}
              {cart.length > 0 && <Badge variant="secondary">{cart.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-2 opacity-50" /><p>{t('emptyCart')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {language === 'sw' ? item.nameSwahili : item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('ksh')} {item.unitPrice.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.productId, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.productId, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => setCart((c) => c.filter((i) => i.productId !== item.productId))}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-medium text-sm w-20 text-right">
                      {t('ksh')} {item.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-3 border-t pt-4">
            <div className="flex justify-between w-full text-lg font-bold">
              <span>{t('total')}</span>
              <span>{t('ksh')} {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setCart([])} disabled={!cart.length}>
                {t('clearCart')}
              </Button>
              <Button className="flex-1" onClick={() => setShowPayment(true)} disabled={!cart.length}>
                {t('checkout')}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('payment')}</DialogTitle>
            <DialogDescription>{t('total')}: {t('ksh')} {cartTotal.toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                className="h-20 flex-col gap-2" onClick={() => setPaymentMethod('cash')}>
                <CreditCard className="h-6 w-6" />{t('cash')}
              </Button>
              <Button variant={paymentMethod === 'mpesa' ? 'default' : 'outline'}
                className="h-20 flex-col gap-2" onClick={() => setPaymentMethod('mpesa')}>
                <Smartphone className="h-6 w-6" />{t('mpesa')}
              </Button>
            </div>
            {paymentMethod === 'mpesa' && (
              <div className="space-y-2">
                <Label htmlFor="phone">{t('customerPhone')}</Label>
                <Input id="phone" placeholder="07XX XXX XXX" value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)}>{t('cancel')}</Button>
            <Button onClick={processPayment} disabled={createSale.isPending}>
              {createSale.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('loading')}</>
              ) : t('processPayment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />{t('paymentSuccessful')}
            </DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="font-bold text-lg">Agrovet POS</h2>
                <p className="text-sm text-muted-foreground">{t('receipt')}</p>
                <p className="text-xs text-muted-foreground">{new Date(lastSale.createdAt).toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                {lastSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{language === 'sw' ? item.nameSwahili : item.name} × {item.quantity}</span>
                    <span>{t('ksh')} {item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t('total')}</span>
                <span>{t('ksh')} {lastSale.total.toLocaleString()}</span>
              </div>
              <div className="text-sm space-y-1">
                <p>{t('payment')}: {lastSale.paymentMethod === 'mpesa' ? 'M-Pesa' : t('cash')}</p>
                {lastSale.mpesaRef && <p>{t('transactionRef')}: {lastSale.mpesaRef}</p>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />{t('printReceipt')}
            </Button>
            <Button onClick={newSale}>{t('newSale')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;