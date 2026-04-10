import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AdminUser } from '@/api/auth';

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.getMe();
        setAdmin(me);
      } catch {
        // Token invalid/expired and refresh failed → clear everything
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('admin');
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { admin: adminData, accessToken, refreshToken } = await authApi.login({
        username,
        password,
      });
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('admin', JSON.stringify(adminData));
      setAdmin(adminData);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — clear client state regardless
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('admin');
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ admin, isAuthenticated: !!admin, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};