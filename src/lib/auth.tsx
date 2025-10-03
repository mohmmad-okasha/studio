'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تحقق من وجود بيانات المستخدم في localStorage عند تحميل التطبيق
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Retrieved user data from localStorage:', userData); // تسجيل للتتبع

        // التحقق من وجود الحقول الأساسية فقط
        if (userData && userData.id && userData.name) {
          setUser(userData);
          setToken(savedToken);
        } else {
          console.log('Invalid user data in localStorage, clearing...');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('خطأ في قراءة بيانات المستخدم:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, userToken: string) => {
    console.log('Logging in user:', userData); // تسجيل للتتبع
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
