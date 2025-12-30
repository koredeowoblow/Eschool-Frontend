
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';
import { initEcho } from '../services/echo';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: string | undefined): UserRole => {
  if (!role) return UserRole.STUDENT;
  const r = role.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (r.includes('superadmin')) return UserRole.SUPER_ADMIN;
  if (r.includes('schooladmin')) return UserRole.SCHOOL_ADMIN;
  if (r.includes('teacher')) return UserRole.TEACHER;
  if (r.includes('guardian') || r.includes('parent')) return UserRole.GUARDIAN;
  if (r.includes('student')) return UserRole.STUDENT;
  if (r.includes('finance')) return UserRole.SCHOOL_ADMIN;
  return UserRole.STUDENT;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [echo, setEcho] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('eschool_user');
    const token = localStorage.getItem('eschool_token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.role = normalizeRole(parsedUser.role);
        setUser(parsedUser);
        
        // Connect Echo with cleanup check
        if (token) {
          const apiUrl = 'https://eschool-1.onrender.com/api/v1';
          const echoInstance = initEcho(token, apiUrl.replace('/api/v1', ''));
          setEcho(echoInstance);
          (window as any).Echo = echoInstance;
        }
      } catch (e) {
        console.error("Corrupted session data. Clearing cache.");
        localStorage.removeItem('eschool_token');
        localStorage.removeItem('eschool_user');
      }
    }
    setIsLoading(false);

    return () => {
      if (echo) {
        try { echo.disconnect(); } catch (e) {}
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      const responseData = response.data?.data || response.data;
      const { user: userData, token } = responseData || {};
      
      if (!token) throw new Error("Authentication failure: Missing Token.");

      const normalizedRole = normalizeRole(userData?.role || 'Student');

      const newUser: User = {
        id: String(userData?.id || '1'),
        name: userData?.name || email.split('@')[0],
        email: userData?.email || email,
        role: normalizedRole,
        avatar: userData?.avatar || `https://picsum.photos/seed/${email}/100/100`
      };

      // Disconnect existing echo before login
      if (echo) try { echo.disconnect(); } catch(e){}

      setUser(newUser);
      localStorage.setItem('eschool_token', token);
      localStorage.setItem('eschool_user', JSON.stringify(newUser));

      const apiUrl = 'https://eschool-1.onrender.com/api/v1';
      const echoInstance = initEcho(token, apiUrl.replace('/api/v1', ''));
      setEcho(echoInstance);
      (window as any).Echo = echoInstance;

    } catch (error: any) {
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (echo) {
      try { echo.disconnect(); } catch (e) {}
    }
    setUser(null);
    setEcho(null);
    (window as any).Echo = undefined;
    localStorage.removeItem('eschool_token');
    localStorage.removeItem('eschool_user');
    api.post('/logout').catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
