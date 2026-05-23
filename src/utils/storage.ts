
import { authApi } from '@/api/auth';
import { ordersApi, PurchaseOrder } from '@/api/orders';
import { productsApi, Product, ProductPayload } from '@/api/products';
import { salesApi, CreateSalePayload, Sale } from '@/api/sales';
import { suppliersApi, Supplier, SupplierPayload } from '@/api/suppliers';
import { AppSettings } from '@/types';

const toProductPayload = (product: Product): Partial<ProductPayload> => ({
  name: product.name,
  nameSwahili: product.nameSwahili,
  category: product.category,
  sku: product.sku,
  quantity: product.quantity,
  minStockLevel: product.minStockLevel,
  buyingPrice: product.buyingPrice,
  sellingPrice: product.sellingPrice,
  expiryDate: product.expiryDate || undefined,
  batchNumber: product.batchNumber,
  supplierId: typeof product.supplierId === 'string' ? product.supplierId : product.supplierId?._id,
});

export const validateCredentials = async (username: string, password: string) => {
  try {
    await authApi.login({ username, password });
    return true;
  } catch {
    return false;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await productsApi.getAll({ limit: 200 });
  return data;
};

export const addProduct = async (product: ProductPayload) => {
  return productsApi.create(product);
};

export const updateProduct = async (product: Product) => {
  return productsApi.update(product._id, toProductPayload(product));
};

export const deleteProduct = async (id: string) => {
  return productsApi.delete(id);
};

export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data } = await suppliersApi.getAll({ limit: 200 });
  return data;
};

export const addSupplier = async (supplier: SupplierPayload) => {
  return suppliersApi.create(supplier);
};

export const updateSupplier = async (supplier: Supplier) => {
  const { _id, ...payload } = supplier;
  return suppliersApi.update(_id, payload);
};

export const deleteSupplier = async (id: string) => {
  return suppliersApi.delete(id);
};

export const getSales = async (): Promise<Sale[]> => {
  const { data } = await salesApi.getAll({ limit: 500 });
  return data;
};

export const addSale = async (sale: CreateSalePayload) => {
  return salesApi.create(sale);
};

export const getOrders = async (): Promise<PurchaseOrder[]> => {
  const { data } = await ordersApi.getAll({ limit: 200 });
  return data;
};

export const addOrder = async (order: Parameters<typeof ordersApi.create>[0]) => {
  return ordersApi.create(order);
};

export const updateOrder = async (order: PurchaseOrder) => {
  return ordersApi.updateStatus(order._id, order.status);
};

const SETTINGS_KEY = 'agrovet_settings';
const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  lowStockThreshold: 10,
  expiryWarningDays: 30,
  autoOrderEnabled: true,
};

export const getSettings = (): AppSettings => {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    return s ? JSON.parse(s) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const exportAllData = async () => {
  const [products, suppliers, sales, orders] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getSales(),
    getOrders(),
  ]);

  return JSON.stringify({ products, suppliers, sales, orders, exportedAt: new Date().toISOString() }, null, 2);
};

export const importAllData = (_json: string) => {
  console.warn('importAllData: not supported with API backend');
  return false;
};

export const createSession = () => null;
export const getSession = () => null;
export const clearSession = () => {};
export const initializeDefaultData = () => {};
export const initializeAdmin = () => {};
export const saveProducts = () => {};
export const saveSuppliers = () => {};
export const saveSales = () => {};
export const saveOrders = () => {};
