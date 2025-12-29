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
        setUser(parsedUser);
        
        const apiUrl = 'https://eschool-1.onrender.com/api/v1';
        const echoInstance = initEcho(token, apiUrl.replace('/api/v1', ''));
        setEcho(echoInstance);
        (window as any).Echo = echoInstance;
      } catch (e) {
        console.error("Session restoration failed:", e);
        localStorage.removeItem('eschool_token');
        localStorage.removeItem('eschool_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      
      const responseData = response.data?.data || response.data;
      const { user: userData, token } = responseData || {};
      
      if (!token) {
        throw new Error("Authentication failed: No token received from server.");
      }

      const newUser: User = {
        id: String(userData?.id || '1'),
        name: userData?.name || email.split('@')[0],
        email: userData?.email || email,
        role: (userData?.role as UserRole) || UserRole.STUDENT,
        avatar: userData?.avatar || `https://picsum.photos/seed/${email}/100/100`
      };

      setUser(newUser);
      localStorage.setItem('eschool_token', token);
      localStorage.setItem('eschool_user', JSON.stringify(newUser));

      try {
        const apiUrl = 'https://eschool-1.onrender.com/api/v1';
        const echoInstance = initEcho(token, apiUrl.replace('/api/v1', ''));
        setEcho(echoInstance);
        (window as any).Echo = echoInstance;
      } catch (echoError) {
        console.warn("Echo failed to initialize", echoError);
      }

    } catch (error: any) {
      // Avoid concatenating strings with objects to prevent [object Object]
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Auth Logic Error: ${msg}`, error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (echo) {
      try {
        echo.disconnect();
      } catch (e) {}
    }
    setUser(null);
    setEcho(null);
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};