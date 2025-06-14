// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:3000',
// });

// api.interceptors.request.use((config) => {
//   try {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       const token = localStorage.getItem('smaipa_token');
//       if (token) {
//         if (config.headers) {
//           config.headers['Authorization'] = `Bearer ${token}`;
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Erro ao acessar o localStorage:', error);
//   }
//   return config;
// });

// export default api;


import axios, { AxiosHeaders } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Lista de rotas que não precisam de autenticação
const publicRoutes = [
  '/usuarios/login',
  '/usuarios/recuperar-senha',
  '/usuarios/resetar-senha',
  '/usuarios/validar-token',
  '/redefinir-senha',
  '/favicon.ico'
];

api.interceptors.request.use((config) => {
  try {
    // Log da requisição
    console.log('Requisição:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });

    // Verifica se a requisição é para uma rota pública
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    // Adiciona o token para todas as requisições não públicas
    if (!isPublicRoute && typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('smaipa_token');
      if (token) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        config.headers.set('Authorization', `Bearer ${token.trim()}`);
        console.log('Token adicionado:', token);
      } else {
        console.log('Token não encontrado no localStorage');
        // Redireciona para o login se não houver token em rotas não públicas
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
  } catch (error) {
    console.error('Erro ao acessar o localStorage:', error);
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => {
    // Log da resposta bem-sucedida
    console.log('Resposta:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    // Log detalhado do erro
    console.error('Erro na requisição:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    });

    if (error.response?.status === 401) {
      console.log('Erro 401 detectado, verificando se é necessário logout...');
      
      // Verifica se o erro é de token inválido ou expirado
      const errorMessage = error.response.data?.error;
      if (errorMessage === 'Token expirado' || errorMessage === 'Token inválido') {
        console.log('Token inválido ou expirado, realizando logout...');
        localStorage.removeItem('smaipa_token');
        localStorage.removeItem('smaipa_user');
        window.location.href = '/login';
      } else {
        console.log('Erro 401 não relacionado ao token, mantendo sessão...');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
