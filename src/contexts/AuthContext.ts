import { createContext } from 'react';
import { AuthContextType } from '@/types/auth';

const defaultContext: AuthContextType = {
  user: null,
  login: async (email: string, password: string) => {
    throw new Error('AuthContext not initialized');
  },
  logout: () => {},
  isAuthenticated: false,
  isSecretaria: false,
  isAdmin: false
};

export const AuthContext = createContext<AuthContextType>(defaultContext); 