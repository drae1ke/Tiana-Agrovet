import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/api/errors';
import { productsApi, ProductPayload, ProductsQuery } from '@/api/products';
import { toast } from 'sonner';

export const PRODUCTS_KEY = 'products';

export const useProducts = (params?: ProductsQuery) =>
  useQuery({
    queryKey: [PRODUCTS_KEY, params],
    queryFn: () => productsApi.getAll(params),
    staleTime: 30_000,
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });

export const useProductStats = () =>
  useQuery({
    queryKey: [PRODUCTS_KEY, 'stats'],
    queryFn: productsApi.getDashboardStats,
    staleTime: 60_000,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Product added successfully');
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Failed to add product')),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) =>
      productsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Product updated successfully');
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Failed to update product')),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Product deleted');
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Failed to delete product')),
  });
};

export const useRestockProduct = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      quantity,
      batchNumber,
      expiryDate,
      imageUrl,
    }: {
      id: string;
      quantity: number;
      batchNumber?: string;
      expiryDate?: string;
      imageUrl?: string;
    }) => productsApi.restock(id, quantity, batchNumber, expiryDate, imageUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Product restocked');
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Restock failed')),
  });
};
