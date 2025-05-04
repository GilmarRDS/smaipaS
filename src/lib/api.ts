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


import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  try {
    // Verifica se a requisição é para a rota de recuperação de senha
    if (config.url && config.url.includes('/usuarios/recuperar-senha')) {
      return config; // Não adiciona o token para essa rota
    }

    // Adiciona o token para outras requisições
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
