import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';
import { initEcho } from '../services/echo';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRoleString = (role: any): string => {
  if (!role) return '';
  let val = '';
  if (typeof role === 'string') {
    val = role;
  } else if (typeof role === 'object') {
    val = role.name || role.slug || role.title || JSON.stringify(role);
  } else {
    val = String(role);
  }
  return val.toLowerCase().trim().replace(/\s+/g, '_');
};

const mapToUserRole = (roles: string[]): UserRole => {
  if (roles.includes('super_admin')) return UserRole.SUPER_ADMIN;
  if (roles.includes('school_admin')) return UserRole.SCHOOL_ADMIN;
  if (roles.includes('finance_officer')) return UserRole.FINANCE_OFFICER;
  if (roles.includes('exams_officer')) return UserRole.EXAMS_OFFICER;
  if (roles.includes('teacher')) return UserRole.TEACHER;
  if (roles.includes('guardian') || roles.includes('parent')) return UserRole.GUARDIAN;
  return UserRole.STUDENT;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [echo, setEcho] = useState<any>(null);

  const initializeEcho = useCallback((token: string) => {
    try {
      if (echo) echo.disconnect();
      const apiUrl = 'https://eschool-1.onrender.com/api/v1';
      // Pass the base API URL to initEcho which handles hostname extraction
      const echoInstance = initEcho(token, apiUrl);
      setEcho(echoInstance);
      (window as any).Echo = echoInstance;
    } catch (e) {
      console.warn("Realtime engine initialization failed.");
    }
  }, [echo]);

  useEffect(() => {
    const storedUser = localStorage.getItem('eschool_user');
    const token = localStorage.getItem('eschool_token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        initializeEcho(token);
      } catch (e) {
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
      
      if (!token) throw new Error("Authentication failure: Missing Token.");

      const rawRolesArray = Array.isArray(userData?.roles) 
        ? userData.roles 
        : (userData?.role ? [userData.role] : ['Student']);
      
      const normalizedRoles = rawRolesArray
        .map(normalizeRoleString)
        .filter(r => r.length > 0);

      const primaryRole = mapToUserRole(normalizedRoles);

      const newUser: User = {
        id: String(userData?.id || '1'),
        name: userData?.name || email.split('@')[0],
        email: userData?.email || email,
        role: primaryRole,
        roles: normalizedRoles,
        avatar: userData?.avatar || `https://picsum.photos/seed/${email}/100/100`
      };

      setUser(newUser);
      localStorage.setItem('eschool_token', token);
      localStorage.setItem('eschool_user', JSON.stringify(newUser));
      initializeEcho(token);

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

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('eschool_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};