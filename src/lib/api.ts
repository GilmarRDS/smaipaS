// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:3000',
// });

// // Interceptor para adicionar o token de autenticação
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('smaipa_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api; 



import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('smaipa_token');
      if (token) {
        if (config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
  } catch (error) {
    console.error('Erro ao acessar o localStorage:', error);
  }
  return config;
});

export default api;
