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
  status?: 'pending' | 'completed' | 'cancelled';
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

export interface CreateSaleResponse {
  sale: Sale;
  requiresPayment?: boolean;
  checkoutRequestId?: string;
  message?: string;
}

export interface TransactionStatusResponse {
  transaction: {
    status: 'pending' | 'paid' | 'failed';
    receiptNumber?: string;
    failureReason?: string;
  };
  sale: { _id: string; status: string; total: number; itemCount: number } | null;
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

  create: async (payload: CreateSalePayload): Promise<CreateSaleResponse> => {
    const { data } = await api.post('/sales', payload);
    return {
      sale: data.data as Sale,
      requiresPayment: data.requiresPayment,
      checkoutRequestId: data.checkoutRequestId,
      message: data.message,
    };
  },

  getSummary: async (period: 'today' | 'week' | 'month' | 'year' = 'week') => {
    const { data } = await api.get('/sales/reports/summary', { params: { period } });
    return data.data;
  },

  getTopProducts: async (limit = 10, period = 'month') => {
    const { data } = await api.get('/sales/reports/top-products', { params: { limit, period } });
    return data.data;
  },

  getTransactionStatus: async (checkoutRequestId: string): Promise<TransactionStatusResponse> => {
    const { data } = await api.get(`/mpesa/transaction/${checkoutRequestId}`);
    return data;
  },
};
