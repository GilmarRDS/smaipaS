import axios from 'axios';

const API_URL = 'http://localhost:3000/api/descritores';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxZmQ1ZTY0LTA3NmUtNGQ0MS04MDBkLTdmZjFiNWQwMDk4MiIsInJvbGUiOiJzZWNyZXRhcmlhIiwiZXNjb2xhSWQiOiI2YTllNDM2Mi1hNDNlLTQ3MjYtOWJlYy04ZmY5MWQ4OWU2YzkiLCJpYXQiOjE3NDcwOTE1NTcsImV4cCI6MTc0NzE3Nzk1N30.FHRdoMOCfEiAE9xn7CJJWcPYP14-rkR24trtQrvCobw';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

async function testDescritorEndpoints() {
  try {
    // Criar descritor
    const createResponse = await axiosInstance.post('/', {
      codigo: 'TEST123',
      descricao: 'Descritor de teste',
      disciplina: 'Matemática',
      tipo: 'Conceito',
    });
    console.log('Criar descritor:', createResponse.data);

    const descritorId = createResponse.data.id;

    // Listar todos
    const listResponse = await axiosInstance.get('/');
    console.log('Listar descritores:', listResponse.data);

    // Buscar por ID
    const getResponse = await axiosInstance.get(`/${descritorId}`);
    console.log('Buscar descritor por ID:', getResponse.data);

    // Atualizar descritor
    const updateResponse = await axiosInstance.put(`/${descritorId}`, {
      codigo: 'TEST123',
      descricao: 'Descritor de teste atualizado',
      disciplina: 'Matemática',
      tipo: 'Conceito',
    });
    console.log('Atualizar descritor:', updateResponse.data);

    // Deletar descritor
    const deleteResponse = await axiosInstance.delete(`/${descritorId}`);
    console.log('Deletar descritor:', deleteResponse.status === 204 ? 'Sucesso' : 'Falha');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro na requisição:', error.response?.data || error.message);
    } else {
      console.error('Erro inesperado:', error);
    }
  }
}

testDescritorEndpoints();
