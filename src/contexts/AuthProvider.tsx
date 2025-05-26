import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { User } from '@/types/auth';
import { AuthContext } from './AuthContext';
import { AxiosError } from 'axios';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('smaipa_token');
        if (token) {
          const response = await api.get('/usuarios/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('smaipa_token');
        localStorage.removeItem('smaipa_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/usuarios/login', { 
        email, 
        senha: password 
      });
      const { token, usuario } = response.data;

      const userData: User = {
        id: usuario.id,
        name: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        schoolId: usuario.role === 'escola' ? usuario.escolaId : usuario.escolaId || '',
        schoolName: usuario.escola?.nome
      };

      localStorage.setItem('smaipa_user', JSON.stringify(userData));
      localStorage.setItem('smaipa_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      setIsAuthenticated(true);
      toast.success(`Bem-vindo(a), ${userData.name}!`);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error;
        
        if (error.response?.status === 401) {
          toast.error('Credenciais inválidas', {
            description: errorMessage || 'Email ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.'
          });
        } else if (error.response?.status === 404) {
          toast.error('Usuário não encontrado', {
            description: errorMessage || 'Não foi encontrado um usuário com este email.'
          });
        } else {
          toast.error('Erro ao fazer login', {
            description: errorMessage || 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.'
          });
        }
      } else {
        toast.error('Erro ao fazer login', {
          description: 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.'
        });
      }
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('smaipa_user');
    localStorage.removeItem('smaipa_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Sessão encerrada');
  };

  const isSecretaria = user?.role === 'secretaria';
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isSecretaria,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 