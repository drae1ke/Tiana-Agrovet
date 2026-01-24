import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminSession } from '@/types';
import { 
  validateCredentials, 
  createSession, 
  getSession, 
  clearSession,
  initializeDefaultData 
} from '@/utils/storage';

interface AuthContextType {
  session: AdminSession | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default data and check for existing session
    initializeDefaultData();
    const existingSession = getSession();
    setSession(existingSession);
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (validateCredentials(username, password)) {
      const newSession = createSession(username);
      setSession(newSession);
      return true;
    }
    return false;
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  const isAuthenticated = session?.isAuthenticated ?? false;

  return (
    <AuthContext.Provider value={{ session, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
