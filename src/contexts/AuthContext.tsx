
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

// Tipos para usuários
export type UserRole = 'secretaria' | 'escola';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
}

// Mock de usuários para demonstração
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin Secretaria',
    email: 'admin@secretaria.edu.br',
    role: 'secretaria',
  },
  {
    id: '2',
    name: 'Escola Municipal A',
    email: 'escola.a@escolas.edu.br',
    role: 'escola',
    schoolId: 'escola-1',
    schoolName: 'Escola Municipal A'
  },
  {
    id: '3',
    name: 'Escola Municipal B',
    email: 'escola.b@escolas.edu.br',
    role: 'escola',
    schoolId: 'escola-2',
    schoolName: 'Escola Municipal B'
  }
];

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isSecretaria: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Verificar se existe um usuário no localStorage
    const storedUser = localStorage.getItem('smaipa_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage', error);
        localStorage.removeItem('smaipa_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular atraso de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar credenciais (simplificado para demonstração)
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser && password === '123456') { // Senha fixa para demonstração
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('smaipa_user', JSON.stringify(foundUser));
      toast.success(`Bem-vindo(a), ${foundUser.name}!`);
      return true;
    }
    
    toast.error('Credenciais inválidas');
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('smaipa_user');
    toast.info('Sessão encerrada');
  };

  const isSecretaria = user?.role === 'secretaria';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isSecretaria }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
