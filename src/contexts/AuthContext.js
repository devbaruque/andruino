import React, {createContext, useContext, useEffect, useState} from 'react';
import {AuthService} from '../services';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Inicializar o AuthService
      await AuthService.initialize();
      
      // Verificar se há um usuário logado
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);
      
      // Adicionar listener para mudanças de autenticação
      AuthService.addAuthListener(handleAuthChange);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthChange = (event, userData) => {
    console.log('Auth context - evento:', event, userData?.email);
    
    switch (event) {
      case 'signIn':
      case 'tokenRefresh':
      case 'userUpdate':
        setUser(userData);
        break;
      case 'signOut':
        setUser(null);
        break;
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await AuthService.signIn(email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      const result = await AuthService.signUp(email, password, metadata);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      return true;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const result = await AuthService.resetPassword(email);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = await AuthService.updateProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 