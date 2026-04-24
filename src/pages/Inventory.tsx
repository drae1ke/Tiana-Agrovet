import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, ProductCategory } from '@/types';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

const categories: ProductCategory[] = ['seeds', 'fertilizers', 'pesticides', 'veterinary', 'tools'];

const Inventory: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Product | null>(null);

  const { data: productsData } = useProducts({ limit: 200 });
  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;
  const isDeleting = deleteProductMutation.isPending;

  // Ensure products and suppliers are always arrays
  const products = productsData?.data || [];
  const suppliers = suppliersData?.data || [];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameSwahili.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    nameSwahili: '',
    category: 'seeds',
    sku: '',
    quantity: 0,
    minStockLevel: 10,
    buyingPrice: 0,
    sellingPrice: 0,
    expiryDate: '',
    batchNumber: '',
    supplierId: '',
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      nameSwahili: '',
      category: 'seeds',
      sku: '',
      quantity: 0,
      minStockLevel: 10,
      buyingPrice: 0,
      sellingPrice: 0,
      expiryDate: '',
      batchNumber: '',
      supplierId: suppliers[0]?.id || '',
    });
    setShowProductModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      expiryDate: product.expiryDate ? format(parseISO(product.expiryDate), 'yyyy-MM-dd') : '',
    });
    setShowProductModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku) {
      toast.error(language === 'sw' ? 'Jaza taarifa zote' : 'Fill all required fields');
      return;
    }

    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct._id,
        payload: {
          name: formData.name!,
          nameSwahili: formData.nameSwahili || formData.name!,
          category: formData.category as ProductCategory,
          sku: formData.sku!,
          quantity: formData.quantity || 0,
          minStockLevel: formData.minStockLevel || 10,
          buyingPrice: formData.buyingPrice || 0,
          sellingPrice: formData.sellingPrice || 0,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
          batchNumber: formData.batchNumber || '',
          supplierId: formData.supplierId || '',
        }
      }, {
        onSuccess: () => {
          setShowProductModal(false);
          setFormData({
            name: '',
            nameSwahili: '',
            category: 'seeds',
            sku: '',
            quantity: 0,
            minStockLevel: 10,
            buyingPrice: 0,
            sellingPrice: 0,
            expiryDate: '',
            batchNumber: '',
            supplierId: '',
          });
        }
      });
    } else {
      createProductMutation.mutate({
        name: formData.name!,
        nameSwahili: formData.nameSwahili || formData.name!,
        category: formData.category as ProductCategory,
        sku: formData.sku!,
        quantity: formData.quantity || 0,
        minStockLevel: formData.minStockLevel || 10,
        buyingPrice: formData.buyingPrice || 0,
        sellingPrice: formData.sellingPrice || 0,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
        batchNumber: formData.batchNumber || '',
        supplierId: formData.supplierId || '',
      }, {
        onSuccess: () => {
          setShowProductModal(false);
          setFormData({
            name: '',
            nameSwahili: '',
            category: 'seeds',
            sku: '',
            quantity: 0,
            minStockLevel: 10,
            buyingPrice: 0,
            sellingPrice: 0,
            expiryDate: '',
            batchNumber: '',
            supplierId: '',
          });
        }
      });
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteProductMutation.mutate(showDeleteConfirm._id, {
        onSuccess: () => {
          setShowDeleteConfirm(null);
        }
      });
    }
  };

  const getStockBadge = (product: Product) => {
    if (product.quantity <= 0) {
      return <Badge variant="destructive">{language === 'sw' ? 'Haipatikani' : 'Out of Stock'}</Badge>;
    }
    if (product.quantity <= product.minStockLevel) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{language === 'sw' ? 'Chache' : 'Low'}</Badge>;
    }
    return <Badge variant="secondary">{language === 'sw' ? 'Inapatikana' : 'In Stock'}</Badge>;
  };

  const getExpiryBadge = (product: Product) => {
    if (!product.expiryDate) return null;
    const days = differenceInDays(parseISO(product.expiryDate), new Date());
    if (days < 0) {
      return <Badge variant="destructive">{language === 'sw' ? 'Imeisha' : 'Expired'}</Badge>;
    }
    if (days <= 7) {
      return <Badge variant="destructive">{days}d</Badge>;
    }
    if (days <= 30) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">{days}d</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('inventory')}
          </CardTitle>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addProduct')}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchProducts')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{t(cat)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('productName')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('sku')}</TableHead>
                  <TableHead className="text-right">{t('quantity')}</TableHead>
                  <TableHead className="text-right">{t('sellingPrice')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {language === 'sw' ? product.nameSwahili : product.name}
                        </p>
                        {product.batchNumber && (
                          <p className="text-xs text-muted-foreground">
                            Batch: {product.batchNumber}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(product.category)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.quantity <= product.minStockLevel && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        {product.quantity}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {t('ksh')} {product.sellingPrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {getStockBadge(product)}
                        {getExpiryBadge(product)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(product)}
                          disabled={isSubmitting || isDeleting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setShowDeleteConfirm(product)}
                          disabled={isSubmitting || isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
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

      {/* Add/Edit Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? t('editProduct') : t('addProduct')}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('productName')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameSwahili">{t('productNameSwahili')}</Label>
                <Input
                  id="nameSwahili"
                  value={formData.nameSwahili}
                  onChange={(e) => setFormData({ ...formData, nameSwahili: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t('category')}</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value as ProductCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{t(cat)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">{t('sku')} *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">{t('quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStockLevel">{t('minStockLevel')}</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyingPrice">{t('buyingPrice')} (KSh)</Label>
                <Input
                  id="buyingPrice"
                  type="number"
                  min="0"
                  value={formData.buyingPrice}
                  onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">{t('sellingPrice')} (KSh)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">{t('expiryDate')}</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNumber">{t('batchNumber')}</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="supplier">{t('supplier')}</Label>
                <Select 
                  value={formData.supplierId} 
                  onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'sw' ? 'Chagua msambazaji' : 'Select supplier'} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(sup => (
                      <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowProductModal(false)} disabled={isSubmitting}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {language === 'sw' ? 'Inahifadhi...' : 'Saving...'}
                  </>
                ) : (
                  t('save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteProduct')}</DialogTitle>
            <DialogDescription>
              {language === 'sw' 
                ? `Una uhakika unataka kufuta "${showDeleteConfirm?.nameSwahili}"?`
                : `Are you sure you want to delete "${showDeleteConfirm?.name}"?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} disabled={isDeleting}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'sw' ? 'Inafuta...' : 'Deleting...'}
                </>
              ) : (
                t('delete')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
