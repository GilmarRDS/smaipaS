export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'coordenador' | 'secretaria';
  escolaId: string;
} 