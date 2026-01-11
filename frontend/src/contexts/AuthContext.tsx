'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import apiClient from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Ne pas initialiser depuis localStorage pour éviter l'erreur d'hydratation
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger depuis localStorage uniquement côté client après le montage
    // Cela évite l'erreur d'hydratation SSR
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id) {
            setUser(parsed);
          }
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      } else {
        // Clean up invalid state
        if (storedUser) localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(email, password, role);
      console.log('[AuthContext] Login response:', response);
      
      // Check if login was successful (backend returns success: false on failure)
      if (response.success === false) {
        throw new Error(response.message || 'Échec de la connexion');
      }
      
      const userData = response.user || response.client || response.advisor || response.director;
      
      if (!userData || !userData.id) {
        console.error('[AuthContext] No user data in response:', response);
        throw new Error('Données utilisateur invalides reçues du serveur');
      }
      
      console.log('[AuthContext] Setting user:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient.register(data);
      const userData = response.user || response.client;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
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
