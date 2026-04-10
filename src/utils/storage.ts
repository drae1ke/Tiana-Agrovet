/**
 * storage.ts — API-backed replacement for the original localStorage utilities.
 *
 * Drop-in replacements so existing pages that call getProducts(), getSales(), etc.
 * continue to work while each page is progressively migrated to use React Query /
 * the API services directly.
 *
 * NOTE: These are async under the hood — pages that need them should await or
 * use the hooks in src/hooks/. For pages not yet migrated we keep the old sync
 * signatures as stubs and recommend migrating page by page.
 */

import { productsApi, Product } from '@/api/products';
import { suppliersApi, Supplier } from '@/api/suppliers';
import { salesApi, Sale } from '@/api/sales';
import { ordersApi, PurchaseOrder } from '@/api/orders';
import { authApi } from '@/api/auth';
import { AppSettings } from '@/types';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const validateCredentials = async (username: string, password: string) => {
  try {
    await authApi.login({ username, password });
    return true;
  } catch {
    return false;
  }
};

// ── Products ──────────────────────────────────────────────────────────────────

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await productsApi.getAll({ limit: 200 });
  return data;
};

export const addProduct = async (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
  return productsApi.create(product as any);
};

export const updateProduct = async (product: Product) => {
  return productsApi.update(product._id, product as any);
};

export const deleteProduct = async (id: string) => {
  return productsApi.delete(id);
};

// ── Suppliers ─────────────────────────────────────────────────────────────────

export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data } = await suppliersApi.getAll({ limit: 200 });
  return data;
};

export const addSupplier = async (supplier: Omit<Supplier, '_id' | 'createdAt' | 'updatedAt'>) => {
  return suppliersApi.create(supplier as any);
};

export const updateSupplier = async (supplier: Supplier) => {
  return suppliersApi.update(supplier._id, supplier as any);
};

export const deleteSupplier = async (id: string) => {
  return suppliersApi.delete(id);
};

// ── Sales ─────────────────────────────────────────────────────────────────────

export const getSales = async (): Promise<Sale[]> => {
  const { data } = await salesApi.getAll({ limit: 500 });
  return data;
};

export const addSale = async (sale: any) => {
  return salesApi.create(sale);
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const getOrders = async (): Promise<PurchaseOrder[]> => {
  const { data } = await ordersApi.getAll({ limit: 200 });
  return data;
};

export const addOrder = async (order: any) => {
  return ordersApi.create(order);
};

export const updateOrder = async (order: PurchaseOrder) => {
  return ordersApi.updateStatus(order._id, order.status);
};

// ── Settings (kept local — no backend endpoint needed) ───────────────────────

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

// ── Data export/import (kept local) ─────────────────────────────────────────

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

// ── Legacy no-ops (session now managed by AuthContext) ────────────────────────

export const createSession = () => null;
export const getSession = () => null;
export const clearSession = () => {};
export const initializeDefaultData = () => {};
export const initializeAdmin = () => {};
export const saveProducts = () => {};
export const saveSuppliers = () => {};
export const saveSales = () => {};
export const saveOrders = () => {};