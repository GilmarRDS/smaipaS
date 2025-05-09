import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Verificando autenticação...');
        const storedUser = localStorage.getItem('smaipa_user');
        const token = localStorage.getItem('smaipa_token');
        
        console.log('Dados armazenados:', { storedUser, token });
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          console.log('Dados do usuário encontrados:', userData);
          
          try {
            console.log('Verificando token...');
            const response = await api.get('/usuarios/me');
            console.log('Resposta da verificação:', response.data);
            
            setUser(userData);
            setIsAuthenticated(true);
            console.log('Usuário autenticado com sucesso');
          } catch (error) {
            console.error('Erro ao verificar token:', error);
            if (error.response?.status === 401) {
              console.log('Token inválido, realizando logout...');
              logout();
            }
          }
        } else {
          console.log('Nenhum dado de autenticação encontrado');
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
    toast.info('Sessão encerrada');
    console.log('Logout concluído');
  };

  const isSecretaria = user?.role === 'secretaria';

  if (isLoading) {
    return <div>Carregando...</div>;
  }

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
