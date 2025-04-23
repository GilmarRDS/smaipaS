import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Verificar se existe um usuário no localStorage
    const storedUser = localStorage.getItem('smaipa_user');
    const token = localStorage.getItem('smaipa_token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage', error);
        localStorage.removeItem('smaipa_user');
        localStorage.removeItem('smaipa_token');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/usuarios/login', { 
        email, 
        senha: password 
      });
      
      const { token, usuario } = response.data;
      
      // Converter o formato do usuário do backend para o formato do frontend
      const userData: User = {
        id: usuario.id,
        name: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        schoolId: usuario.role === 'escola' ? usuario.escolaId || usuario.escola?.id || '' : '',
        schoolName: usuario.escola?.nome
      };
      
      if (userData.role === 'escola' && !userData.schoolId) {
        throw new Error('Usuário do tipo escola deve ter um schoolId definido');
      }
      
      localStorage.setItem('smaipa_token', token);
      localStorage.setItem('smaipa_user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(`Bem-vindo(a), ${userData.name}!`);
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Credenciais inválidas');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('smaipa_user');
    localStorage.removeItem('smaipa_token');
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
