import api from './client';

export interface Product {
  _id: string;
  name: string;
  nameSwahili: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'veterinary' | 'tools';
  sku: string;
  quantity: number;
  minStockLevel: number;
  buyingPrice: number;
  sellingPrice: number;
  expiryDate: string | null;
  batchNumber: string;
  supplierId: string | { _id: string; name: string; phone: string; email?: string } | null;
  isActive: boolean;
  daysUntilExpiry?: number;
  isLowStock?: boolean;
  profitMargin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  nameSwahili?: string;
  category: string;
  sku: string;
  quantity: number;
  minStockLevel: number;
  buyingPrice: number;
  sellingPrice: number;
  expiryDate?: string | null;
  batchNumber?: string;
  supplierId?: string;
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  filter?: 'low-stock' | 'expiring' | 'expired';
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const productsApi = {
  getAll: async (params?: ProductsQuery): Promise<{ data: Product[]; pagination: Pagination }> => {
    const { data } = await api.get('/products', { params });
    return { data: data.data, pagination: data.pagination };
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },

  create: async (payload: ProductPayload): Promise<Product> => {
    const { data } = await api.post('/products', payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<ProductPayload>): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  restock: async (id: string, quantity: number, batchNumber?: string, expiryDate?: string): Promise<Product> => {
    const { data } = await api.patch(`/products/${id}/restock`, {
      quantity,
      batchNumber,
      expiryDate,
    });
    return data.data;
  },

  getDashboardStats: async () => {
    const { data } = await api.get('/products/stats/dashboard');
    return data.data;
  },
};