import api from './client';
import type { Product } from './products';

export interface Supplier {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isTrusted: boolean;
  autoOrderEnabled: boolean;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isTrusted?: boolean;
  autoOrderEnabled?: boolean;
}

export interface SupplierDetails extends Supplier {
  products: Product[];
}

export const suppliersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get('/suppliers', { params });
    return { data: data.data as Supplier[], pagination: data.pagination };
  },

  getById: async (id: string): Promise<SupplierDetails> => {
    const { data } = await api.get(`/suppliers/${id}`);
    return data.data;
  },

  create: async (payload: SupplierPayload): Promise<Supplier> => {
    const { data } = await api.post('/suppliers', payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<SupplierPayload>): Promise<Supplier> => {
    const { data } = await api.put(`/suppliers/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};
