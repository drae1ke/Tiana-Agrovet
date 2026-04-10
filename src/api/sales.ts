import api from './client';

export interface SaleItem {
  productId: string;
  name: string;
  nameSwahili?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  _id: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paymentMethod: 'cash' | 'mpesa';
  mpesaRef?: string;
  customerPhone?: string;
  processedBy?: { _id: string; username: string };
  createdAt: string;
}

export interface CreateSalePayload {
  items: { productId: string; quantity: number }[];
  paymentMethod: 'cash' | 'mpesa';
  customerPhone?: string;
}

export const salesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
  }) => {
    const { data } = await api.get('/sales', { params });
    return { data: data.data as Sale[], pagination: data.pagination };
  },

  getById: async (id: string): Promise<Sale> => {
    const { data } = await api.get(`/sales/${id}`);
    return data.data;
  },

  create: async (payload: CreateSalePayload): Promise<Sale> => {
    const { data } = await api.post('/sales', payload);
    return data.data;
  },

  getSummary: async (period: 'today' | 'week' | 'month' | 'year' = 'week') => {
    const { data } = await api.get('/sales/reports/summary', { params: { period } });
    return data.data;
  },

  getTopProducts: async (limit = 10, period = 'month') => {
    const { data } = await api.get('/sales/reports/top-products', { params: { limit, period } });
    return data.data;
  },
};