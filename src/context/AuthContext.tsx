'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin' | 'department';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiClient.post('/auth/login', { email, password });
    apiClient.setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const data = await apiClient.post('/auth/register', { name, email, password, role });
    apiClient.setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await apiClient.post('/auth/logout', {}).catch(() => {});
    apiClient.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
