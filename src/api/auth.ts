import api from './client';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  lastLogin?: string;
}

export interface AuthResponse {
  admin: AdminUser;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', payload);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<AdminUser> => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },

  register: async (payload: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AdminUser> => {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  },

  refreshToken: async (refreshToken: string) => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data.data;
  },
};