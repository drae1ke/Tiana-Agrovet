import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Product } from '@/api/products';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useRestockProduct } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  LayoutGrid,
  List,
  ImagePlus,
  RefreshCw,
  X,
  Leaf,
  Droplets,
  Bug,
  Syringe,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

type ProductCategory = Product['category'];

const categories: ProductCategory[] = ['seeds', 'fertilizers', 'pesticides', 'veterinary', 'tools'];

const categoryConfig: Record<ProductCategory, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  seeds: { icon: Leaf, color: '#166534', bg: '#dcfce7', border: '#16a34a', label: 'Seeds' },
  fertilizers: { icon: Droplets, color: '#0e7490', bg: '#cffafe', border: '#0891b2', label: 'Fertilizers' },
  pesticides: { icon: Bug, color: '#9a3412', bg: '#ffedd5', border: '#ea580c', label: 'Pesticides' },
  veterinary: { icon: Syringe, color: '#6b21a8', bg: '#f3e8ff', border: '#9333ea', label: 'Veterinary' },
  tools: { icon: Wrench, color: '#374151', bg: '#f3f4f6', border: '#6b7280', label: 'Tools' },
};

const PLACEHOLDER_IMAGES: Record<ProductCategory, string> = {
  seeds: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
  fertilizers: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&q=80',
  pesticides: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
  veterinary: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&q=80',
  tools: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80',
};

interface RestockData {
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  imageUrl: string;
}

interface ProductFormData {
  name: string;
  nameSwahili: string;
  imageUrl: string;
  category: ProductCategory;
  sku: string;
  quantity: number;
  minStockLevel: number;
  buyingPrice: number;
  sellingPrice: number;
  expiryDate: string;
  batchNumber: string;
  supplierId: string;
}

const MAX_IMAGE_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const getSupplierIdValue = (supplierId: Product['supplierId']) =>
  typeof supplierId === 'string' ? supplierId : supplierId?._id || '';

const createProductFormData = (supplierId = ''): ProductFormData => ({
  name: '',
  nameSwahili: '',
  imageUrl: '',
  category: 'seeds',
  sku: '',
  quantity: 0,
  minStockLevel: 10,
  buyingPrice: 0,
  sellingPrice: 0,
  expiryDate: '',
  batchNumber: '',
  supplierId,
});

const createRestockData = (imageUrl = '', quantity = 0): RestockData => ({
  quantity,
  batchNumber: '',
  expiryDate: '',
  imageUrl,
});

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

const Inventory: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Product | null>(null);
  const [showRestockModal, setShowRestockModal] = useState<Product | null>(null);
  const [restockData, setRestockData] = useState<RestockData>(createRestockData());
  const [restockImagePreview, setRestockImagePreview] = useState('');
  const [productImagePreview, setProductImagePreview] = useState('');
  const restockFileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const { data: productsData } = useProducts({ limit: 200 });
  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const restockMutation = useRestockProduct();

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;
  const isDeleting = deleteProductMutation.isPending;

  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);
  const suppliers = useMemo(() => suppliersData?.data ?? [], [suppliersData?.data]);

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

  const stats = useMemo(() => ({
    total: products.length,
    lowStock: products.filter(p => p.quantity <= p.minStockLevel).length,
    expiring: products.filter(p => {
      if (!p.expiryDate) return false;
      return differenceInDays(parseISO(p.expiryDate), new Date()) <= 30;
    }).length,
    categories: Object.fromEntries(categories.map(c => [c, products.filter(p => p.category === c).length])),
  }), [products]);

  const [formData, setFormData] = useState<ProductFormData>(createProductFormData());

  const resetProductModal = () => {
    setShowProductModal(false);
    setProductImagePreview('');
  };

  const resetRestockModal = () => {
    setShowRestockModal(null);
    setRestockData(createRestockData());
    setRestockImagePreview('');
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(createProductFormData(suppliers[0]?._id || ''));
    setProductImagePreview('');
    setShowProductModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameSwahili: product.nameSwahili || product.name,
      imageUrl: product.imageUrl || '',
      category: product.category,
      sku: product.sku,
      quantity: product.quantity,
      minStockLevel: product.minStockLevel,
      buyingPrice: product.buyingPrice,
      sellingPrice: product.sellingPrice,
      expiryDate: product.expiryDate ? format(parseISO(product.expiryDate), 'yyyy-MM-dd') : '',
      batchNumber: product.batchNumber || '',
      supplierId: getSupplierIdValue(product.supplierId),
    });
    setProductImagePreview(product.imageUrl || '');
    setShowProductModal(true);
  };

  const openRestockModal = (product: Product) => {
    setShowRestockModal(product);
    setRestockData(createRestockData(product.imageUrl || '', 10));
    setRestockImagePreview(product.imageUrl || '');
  };

  const handleLocalImageSelection = async (file: File | undefined, onLoaded: (imageUrl: string) => void) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file');
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      toast.error('Please choose an image smaller than 2 MB');
      return;
    }

    try {
      const imageUrl = await fileToDataUrl(file);
      onLoaded(imageUrl);
    } catch {
      toast.error('Unable to load the selected image');
    }
  };

  const handleRestockImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleLocalImageSelection(file, (imageUrl) => {
      setRestockImagePreview(imageUrl);
      setRestockData((prev) => ({ ...prev, imageUrl }));
    });
    e.target.value = '';
  };

  const handleProductImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleLocalImageSelection(file, (imageUrl) => {
      setProductImagePreview(imageUrl);
      setFormData((prev) => ({ ...prev, imageUrl }));
    });
    e.target.value = '';
  };

  const handleRestockImageUrl = (url: string) => {
    setRestockData((prev) => ({ ...prev, imageUrl: url }));
    setRestockImagePreview(url);
  };

  const handleProductImageUrl = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setProductImagePreview(url);
  };

  const handleRestock = () => {
    if (!showRestockModal || restockData.quantity <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    restockMutation.mutate({
      id: showRestockModal._id,
      quantity: restockData.quantity,
      batchNumber: restockData.batchNumber || undefined,
      expiryDate: restockData.expiryDate || undefined,
      imageUrl: restockData.imageUrl,
    }, {
      onSuccess: () => {
        toast.success(`Restocked ${restockData.quantity} units`);
        resetRestockModal();
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) { toast.error('Fill all required fields'); return; }
    const payload = {
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
      supplierId: formData.supplierId,
      imageUrl: formData.imageUrl || '',
    };
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, payload }, { onSuccess: () => resetProductModal() });
    } else {
      createProductMutation.mutate(payload, { onSuccess: () => resetProductModal() });
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteProductMutation.mutate(showDeleteConfirm._id, { onSuccess: () => setShowDeleteConfirm(null) });
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { label: 'Out of Stock', class: 'bg-red-100 text-red-800 border-red-200' };
    if (product.quantity <= product.minStockLevel) return { label: 'Low Stock', class: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: 'In Stock', class: 'bg-green-100 text-green-800 border-green-200' };
  };

  const getExpiryStatus = (product: Product) => {
    if (!product.expiryDate) return null;
    const days = differenceInDays(parseISO(product.expiryDate), new Date());
    if (days < 0) return { days, label: 'Expired', color: '#dc2626' };
    if (days <= 7) return { days, label: `${days}d left`, color: '#dc2626' };
    if (days <= 30) return { days, label: `${days}d left`, color: '#ea580c' };
    return { days, label: `${days}d left`, color: '#16a34a' };
  };

  const margin = (p: Product) => p.buyingPrice > 0
    ? Math.round(((p.sellingPrice - p.buyingPrice) / p.buyingPrice) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1rem' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total SKUs</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--border-radius-lg)', padding: '1rem' }}>
          <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#92400e' }}>{stats.lowStock}</div>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--border-radius-lg)', padding: '1rem' }}>
          <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expiring</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#991b1b' }}>{stats.expiring}</div>
        </div>
        {categories.map(cat => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          return (
            <div key={cat} style={{ background: cfg.bg, border: `1px solid ${cfg.border}30`, borderRadius: 'var(--border-radius-lg)', padding: '1rem', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Icon size={14} color={cfg.color} />
                <span style={{ fontSize: '11px', color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{cfg.label}</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 600, color: cfg.color }}>{stats.categories[cat] || 0}</div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search products, SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', height: '38px', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger style={{ width: '160px', height: '38px', fontSize: '14px' }}>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => <SelectItem key={cat} value={cat}>{categoryConfig[cat].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div style={{ display: 'flex', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '8px 10px', background: viewMode === 'grid' ? 'var(--color-background-secondary)' : 'var(--color-background-primary)', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} style={{ padding: '8px 10px', background: viewMode === 'list' ? 'var(--color-background-secondary)' : 'var(--color-background-primary)', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--color-border-tertiary)' }}>
            <List size={16} />
          </button>
        </div>
        <Button onClick={openAddModal} style={{ height: '38px', gap: '6px' }}>
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      {/* Product count */}
      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        Showing <strong>{filteredProducts.length}</strong> of {products.length} products
        {categoryFilter !== 'all' && <span> in <strong>{categoryConfig[categoryFilter as ProductCategory]?.label}</strong></span>}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product);
            const expiryStatus = getExpiryStatus(product);
            const cfg = categoryConfig[product.category];
            const Icon = cfg.icon;
            const profitMargin = margin(product);
            const imgSrc = product.imageUrl || PLACEHOLDER_IMAGES[product.category];

            return (
              <div key={product._id} style={{ background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                {/* Image */}
                <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: cfg.bg }}>
                  <img
                    src={imgSrc}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[product.category]; }}
                  />
                  {/* Category badge */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 500, color: cfg.color }}>
                    <Icon size={12} />
                    {cfg.label}
                  </div>
                  {/* Stock badge */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 500 }} className={stockStatus.class}>
                    {stockStatus.label}
                  </div>
                  {/* Expiry badge */}
                  {expiryStatus && (
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: `${expiryStatus.color}18`, border: `1px solid ${expiryStatus.color}40`, borderRadius: '999px', padding: '3px 8px', fontSize: '11px', fontWeight: 500, color: expiryStatus.color }}>
                      {expiryStatus.label}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '14px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3, marginBottom: '2px' }}>
                      {language === 'sw' ? product.nameSwahili : product.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{product.sku}</div>
                  </div>

                  {/* Stock bar */}
                  <div style={{ margin: '12px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      <span>Stock</span>
                      <span style={{ fontWeight: 500 }}>{product.quantity} / {product.minStockLevel} min</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--color-border-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (product.quantity / Math.max(product.minStockLevel * 2, 1)) * 100)}%`, background: product.quantity <= product.minStockLevel ? '#ef4444' : product.quantity <= product.minStockLevel * 1.5 ? '#f59e0b' : '#22c55e', borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>
                  </div>

                  {/* Price row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Selling price</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>KSh {product.sellingPrice.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: profitMargin > 0 ? '#16a34a' : '#dc2626', background: profitMargin > 0 ? '#dcfce7' : '#fee2e2', padding: '3px 8px', borderRadius: '999px', fontWeight: 500 }}>
                      {profitMargin > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {profitMargin}%
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openRestockModal(product)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 'var(--border-radius-md)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                      <RefreshCw size={12} /> Restock
                    </button>
                    <button onClick={() => openEditModal(product)} style={{ padding: '8px 10px', background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(product)} style={{ padding: '8px 10px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--border-radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#dc2626' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-secondary)' }}>
              <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <div style={{ fontSize: '16px', fontWeight: 500 }}>No products found</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>Try adjusting your filters</div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div style={{ background: 'var(--color-background-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-background-secondary)', borderBottom: '1px solid var(--color-border-tertiary)' }}>
                {['Product', 'Category', 'SKU', 'Stock', 'Sell Price', 'Margin', 'Expiry', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, i) => {
                const stockStatus = getStockStatus(product);
                const expiryStatus = getExpiryStatus(product);
                const cfg = categoryConfig[product.category];
                const profitMargin = margin(product);
                return (
                  <tr key={product._id} style={{ borderBottom: i < filteredProducts.length - 1 ? '1px solid var(--color-border-tertiary)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={product.imageUrl || PLACEHOLDER_IMAGES[product.category]} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', background: cfg.bg }} onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[product.category]; }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{language === 'sw' ? product.nameSwahili : product.name}</div>
                          {product.batchNumber && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Batch: {product.batchNumber}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: cfg.color, background: cfg.bg, padding: '3px 8px', borderRadius: '999px', fontWeight: 500 }}>
                        <cfg.icon size={11} />{cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{product.sku}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {product.quantity <= product.minStockLevel && <AlertTriangle size={12} color="#f59e0b" />}
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{product.quantity}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>/ {product.minStockLevel}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>KSh {product.sellingPrice.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: profitMargin > 0 ? '#16a34a' : '#dc2626', background: profitMargin > 0 ? '#dcfce7' : '#fee2e2', padding: '2px 8px', borderRadius: '999px', fontWeight: 500 }}>
                        {profitMargin > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{profitMargin}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: expiryStatus ? expiryStatus.color : 'var(--color-text-secondary)' }}>
                      {expiryStatus ? expiryStatus.label : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => openRestockModal(product)} style={{ padding: '5px 10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 'var(--border-radius-md)', fontSize: '11px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <RefreshCw size={10} />Restock
                        </button>
                        <button onClick={() => openEditModal(product)} style={{ padding: '5px 8px', background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                          <Edit size={12} />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(product)} style={{ padding: '5px 8px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--border-radius-md)', cursor: 'pointer', color: '#dc2626' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>No products found</div>
          )}
        </div>
      )}

      {/* Restock Modal */}
      <Dialog open={!!showRestockModal} onOpenChange={(open) => { if (!open) resetRestockModal(); }}>
        <DialogContent style={{ maxWidth: '560px' }}>
          <DialogHeader>
            <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={18} />
              Restock — {showRestockModal ? (language === 'sw' ? showRestockModal.nameSwahili : showRestockModal.name) : ''}
            </DialogTitle>
            <DialogDescription>Add stock and optionally update the product image</DialogDescription>
          </DialogHeader>

          {showRestockModal && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Image section */}
              <div style={{ width: '180px', flexShrink: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Image</div>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', background: categoryConfig[showRestockModal.category].bg, border: '2px dashed var(--color-border-tertiary)' }}>
                  <img
                    src={restockImagePreview || PLACEHOLDER_IMAGES[showRestockModal.category]}
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[showRestockModal.category]; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                    <button type="button" onClick={() => restockFileInputRef.current?.click()} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500 }}>
                      <ImagePlus size={14} /> Choose image
                    </button>
                  </div>
                </div>
                <input ref={restockFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleRestockImageFile} />
                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>Upload from this PC or paste an image URL. Max file size: 2 MB.</div>
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="Or paste image URL..."
                    style={{ width: '100%', padding: '6px 8px', fontSize: '11px', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
                    onChange={e => handleRestockImageUrl(e.target.value)}
                  />
                </div>
                {restockImagePreview && (
                  <button type="button" onClick={() => { setRestockImagePreview(''); setRestockData(prev => ({ ...prev, imageUrl: '' })); }}
                    style={{ marginTop: '6px', width: '100%', padding: '5px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--border-radius-md)', cursor: 'pointer', fontSize: '11px', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <X size={11} /> Clear image
                  </button>
                )}
              </div>

              {/* Form fields */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Current stock</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{showRestockModal.quantity} units</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Min: {showRestockModal.minStockLevel}</div>
                </div>

                <div>
                  <Label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Add Quantity *</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => setRestockData(p => ({ ...p, quantity: Math.max(0, p.quantity - 1) }))} style={{ width: '34px', height: '34px', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={14} />
                    </button>
                    <Input type="number" min="0" value={restockData.quantity} onChange={e => setRestockData(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} style={{ textAlign: 'center', fontWeight: 600, fontSize: '16px' }} />
                    <button onClick={() => setRestockData(p => ({ ...p, quantity: p.quantity + 1 }))} style={{ width: '34px', height: '34px', border: '1px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  {restockData.quantity > 0 && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#16a34a' }}>
                      → New total: {showRestockModal.quantity + restockData.quantity} units
                    </div>
                  )}
                </div>

                <div>
                  <Label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Batch Number</Label>
                  <Input placeholder="e.g. B2024-001" value={restockData.batchNumber} onChange={e => setRestockData(p => ({ ...p, batchNumber: e.target.value }))} />
                </div>

                {showRestockModal.category !== 'tools' && (
                  <div>
                    <Label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>New Expiry Date</Label>
                    <Input type="date" value={restockData.expiryDate} onChange={e => setRestockData(p => ({ ...p, expiryDate: e.target.value }))} />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter style={{ marginTop: '1rem' }}>
            <Button variant="outline" onClick={resetRestockModal}>Cancel</Button>
            <Button onClick={handleRestock} disabled={restockMutation.isPending || restockData.quantity <= 0} style={{ gap: '6px' }}>
              {restockMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Restock {restockData.quantity > 0 ? `+${restockData.quantity}` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Product Modal */}
      <Dialog open={showProductModal} onOpenChange={(open) => { if (!open) resetProductModal(); else setShowProductModal(true); }}>
        <DialogContent style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '1rem' }}>
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '160px 1fr', gap: '14px', alignItems: 'start', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', background: categoryConfig[formData.category].bg, border: '2px dashed var(--color-border-tertiary)' }}>
                  <img
                    src={productImagePreview || PLACEHOLDER_IMAGES[formData.category]}
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES[formData.category]; }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Product Image</Label>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Choose an image from this PC or paste a direct image URL. Max file size: 2 MB.</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button type="button" variant="outline" onClick={() => productFileInputRef.current?.click()} style={{ gap: '6px' }}>
                      <ImagePlus size={14} />
                      Choose image
                    </Button>
                    {productImagePreview && (
                      <Button type="button" variant="outline" onClick={() => { setProductImagePreview(''); setFormData((prev) => ({ ...prev, imageUrl: '' })); }}>
                        Clear image
                      </Button>
                    )}
                  </div>
                  <input ref={productFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProductImageFile} />
                  <Input
                    type="text"
                    placeholder="Or paste image URL..."
                    onChange={e => handleProductImageUrl(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Product Name *</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Swahili Name</Label>
                <Input value={formData.nameSwahili} onChange={e => setFormData({ ...formData, nameSwahili: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v as ProductCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{categoryConfig[c].label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>SKU *</Label>
                <Input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Quantity</Label>
                <Input type="number" min="0" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Min Stock Level</Label>
                <Input type="number" min="0" value={formData.minStockLevel} onChange={e => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Buying Price (KSh)</Label>
                <Input type="number" min="0" value={formData.buyingPrice} onChange={e => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Selling Price (KSh)</Label>
                <Input type="number" min="0" value={formData.sellingPrice} onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Expiry Date</Label>
                <Input type="date" value={formData.expiryDate || ''} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Batch Number</Label>
                <Input value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>Supplier</Label>
                <Select value={getSupplierIdValue(formData.supplierId)} onValueChange={v => setFormData({ ...formData, supplierId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetProductModal} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} style={{ gap: '6px' }}>
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent style={{ maxWidth: '400px' }}>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              This will permanently remove <strong>{showDeleteConfirm?.name}</strong> from your inventory. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} style={{ gap: '6px' }}>
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
