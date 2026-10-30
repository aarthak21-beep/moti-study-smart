import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Language } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; targetCategory?: string; preferredLanguage?: string; targetExam?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchDemoUser: (role: 'student' | 'admin') => Promise<void>;
  isPremium: boolean;
  isTrial: boolean;
  isOwnerAdmin: boolean;
  isSubModalOpen: boolean;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('moti_lang') as Language) || 'mr';
  });
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        // Fallback: auto-login demo student so user gets an instant working interactive experience!
        await switchDemoUser('student');
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      if (data.user.preferredLanguage) {
        setLanguageState(data.user.preferredLanguage);
        localStorage.setItem('moti_lang', data.user.preferredLanguage);
      }
    } catch (err) {
      console.warn('Failed to fetch authenticated user, falling back to demo student', err);
      api.removeToken();
      await switchDemoUser('student');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('moti_lang', lang);
    if (user) {
      try {
        await api.updateLanguage(lang);
        setUser((prev) => (prev ? { ...prev, preferredLanguage: lang } : null));
      } catch (e) {
        console.error('Failed to update language on server', e);
      }
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setUser(res.user);
      if (res.user.preferredLanguage) {
        setLanguageState(res.user.preferredLanguage);
        localStorage.setItem('moti_lang', res.user.preferredLanguage);
      }
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    targetCategory?: string;
    preferredLanguage?: string;
    targetExam?: string;
  }) => {
    setLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      if (res.user.preferredLanguage) {
        setLanguageState(res.user.preferredLanguage as Language);
        localStorage.setItem('moti_lang', res.user.preferredLanguage);
      }
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.removeToken();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (e) {
      console.error('Refresh user error', e);
    }
  };

  const switchDemoUser = async (role: 'student' | 'admin') => {
    setLoading(true);
    try {
      if (role === 'admin') {
        const res = await api.login({ email: 'aarthak21@gmail.com', password: 'Admin@123' });
        setUser(res.user);
      } else {
        const res = await api.login({ email: 'student@motistudy.com', password: 'Student@123' });
        setUser(res.user);
      }
    } catch (e) {
      console.error('Demo switch error', e);
    } finally {
      setLoading(false);
    }
  };

  const isPremium =
    Boolean(user?.role === 'admin' || user?.email === 'aarthak21@gmail.com') ||
    Boolean(user?.subscription?.status === 'active' && user?.subscription?.plan === 'premium');

  const isTrial = Boolean(
    user?.subscription?.status === 'active' && user?.subscription?.plan === 'trial'
  );

  const isOwnerAdmin = Boolean(
    user?.role === 'admin' || user?.email === 'aarthak21@gmail.com'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        language,
        setLanguage,
        login,
        register,
        logout,
        refreshUser,
        switchDemoUser,
        isPremium,
        isTrial,
        isOwnerAdmin,
        isSubModalOpen,
        openSubscriptionModal: () => setIsSubModalOpen(true),
        closeSubscriptionModal: () => setIsSubModalOpen(false),
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
