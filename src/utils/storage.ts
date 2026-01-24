import { Product, Supplier, Sale, PurchaseOrder, AppSettings, AdminSession } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  ADMIN: 'agrovet_admin',
  SESSION: 'agrovet_session',
  PRODUCTS: 'agrovet_products',
  SUPPLIERS: 'agrovet_suppliers',
  SALES: 'agrovet_sales',
  ORDERS: 'agrovet_orders',
  SETTINGS: 'agrovet_settings',
} as const;

// Default admin credentials (in production, this should be properly secured)
const DEFAULT_ADMIN = {
  username: 'admin',
  // Simple hash of 'admin123' - in production use proper hashing
  passwordHash: 'YWRtaW4xMjM=', // base64 of admin123
};

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  lowStockThreshold: 10,
  expiryWarningDays: 30,
  autoOrderEnabled: true,
};

// Generic storage functions
export const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Admin functions
export const initializeAdmin = (): void => {
  const existing = localStorage.getItem(STORAGE_KEYS.ADMIN);
  if (!existing) {
    setItem(STORAGE_KEYS.ADMIN, DEFAULT_ADMIN);
  }
};

export const validateCredentials = (username: string, password: string): boolean => {
  const admin = getItem(STORAGE_KEYS.ADMIN, DEFAULT_ADMIN);
  const passwordHash = btoa(password); // Simple base64 encoding
  return admin.username === username && admin.passwordHash === passwordHash;
};

// Session functions
export const createSession = (username: string): AdminSession => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours
  
  const session: AdminSession = {
    isAuthenticated: true,
    username,
    loginTime: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  
  setItem(STORAGE_KEYS.SESSION, session);
  return session;
};

export const getSession = (): AdminSession | null => {
  const session = getItem<AdminSession | null>(STORAGE_KEYS.SESSION, null);
  
  if (!session) return null;
  
  // Check if session has expired
  if (new Date(session.expiresAt) < new Date()) {
    clearSession();
    return null;
  }
  
  return session;
};

export const clearSession = (): void => {
  removeItem(STORAGE_KEYS.SESSION);
};

// Products functions
export const getProducts = (): Product[] => {
  return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
};

export const saveProducts = (products: Product[]): void => {
  setItem(STORAGE_KEYS.PRODUCTS, products);
};

export const addProduct = (product: Product): void => {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
};

export const updateProduct = (updatedProduct: Product): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
    saveProducts(products);
  }
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts().filter(p => p.id !== productId);
  saveProducts(products);
};

// Suppliers functions
export const getSuppliers = (): Supplier[] => {
  return getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
};

export const saveSuppliers = (suppliers: Supplier[]): void => {
  setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
};

export const addSupplier = (supplier: Supplier): void => {
  const suppliers = getSuppliers();
  suppliers.push(supplier);
  saveSuppliers(suppliers);
};

export const updateSupplier = (updatedSupplier: Supplier): void => {
  const suppliers = getSuppliers();
  const index = suppliers.findIndex(s => s.id === updatedSupplier.id);
  if (index !== -1) {
    suppliers[index] = updatedSupplier;
    saveSuppliers(suppliers);
  }
};

export const deleteSupplier = (supplierId: string): void => {
  const suppliers = getSuppliers().filter(s => s.id !== supplierId);
  saveSuppliers(suppliers);
};

// Sales functions
export const getSales = (): Sale[] => {
  return getItem<Sale[]>(STORAGE_KEYS.SALES, []);
};

export const saveSales = (sales: Sale[]): void => {
  setItem(STORAGE_KEYS.SALES, sales);
};

export const addSale = (sale: Sale): void => {
  const sales = getSales();
  sales.push(sale);
  saveSales(sales);
};

// Orders functions
export const getOrders = (): PurchaseOrder[] => {
  return getItem<PurchaseOrder[]>(STORAGE_KEYS.ORDERS, []);
};

export const saveOrders = (orders: PurchaseOrder[]): void => {
  setItem(STORAGE_KEYS.ORDERS, orders);
};

export const addOrder = (order: PurchaseOrder): void => {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
};

export const updateOrder = (updatedOrder: PurchaseOrder): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === updatedOrder.id);
  if (index !== -1) {
    orders[index] = updatedOrder;
    saveOrders(orders);
  }
};

// Settings functions
export const getSettings = (): AppSettings => {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
};

export const saveSettings = (settings: AppSettings): void => {
  setItem(STORAGE_KEYS.SETTINGS, settings);
};

// Data backup/restore
export const exportAllData = (): string => {
  const data = {
    products: getProducts(),
    suppliers: getSuppliers(),
    sales: getSales(),
    orders: getOrders(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.products) saveProducts(data.products);
    if (data.suppliers) saveSuppliers(data.suppliers);
    if (data.sales) saveSales(data.sales);
    if (data.orders) saveOrders(data.orders);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch {
    return false;
  }
};

// Initialize default data
export const initializeDefaultData = (): void => {
  initializeAdmin();
  
  // Initialize settings if not exists
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!settings) {
    saveSettings(DEFAULT_SETTINGS);
  }
};
