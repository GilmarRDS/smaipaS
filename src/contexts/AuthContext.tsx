import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../lib/api';
import { User } from '../types/auth';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('smaipa_user');
        const token = localStorage.getItem('smaipa_token');
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          
          try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token.trim()}`;
            await api.get('/usuarios/me');
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            if (error.response?.status === 401) {
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Iniciando processo de login...');
      const response = await api.post('/usuarios/login', { 
        email, 
        senha: password 
      });
      
      console.log('Resposta do login:', response.data);
      
      const { token, usuario } = response.data;
      
      if (!token) {
        console.error('Token não recebido na resposta');
        throw new Error('Token não recebido');
      }
      
      const userData: User = {
        id: usuario.id,
        name: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        schoolId: usuario.role === 'escola' ? usuario.escolaId || usuario.escola?.id || '' : '',
        schoolName: usuario.escola?.nome
      };
      
      console.log('Dados do usuário processados:', userData);
      
      if (userData.role === 'escola' && !userData.schoolId) {
        console.error('Usuário do tipo escola sem schoolId');
        throw new Error('Usuário do tipo escola deve ter um schoolId definido');
      }
      
      console.log('Salvando dados no localStorage...');
      localStorage.setItem('smaipa_token', token);
      localStorage.setItem('smaipa_user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token.trim()}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(`Bem-vindo(a), ${userData.name}!`);
      console.log('Login concluído com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Credenciais inválidas');
      return false;
    }
  };

  const logout = () => {
    console.log('Realizando logout...');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('smaipa_user');
    localStorage.removeItem('smaipa_token');
    delete api.defaults.headers.common['Authorization'];
    toast.info('Sessão encerrada');
    console.log('Logout concluído');
  };

  const isSecretaria = user?.role === 'secretaria';
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isSecretaria, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
