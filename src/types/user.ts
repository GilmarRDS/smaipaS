export interface User {
  id: string;
  name: string;
  email: string;
  role: 'secretaria' | 'escola';
  escolaId: string;
  schoolName?: string;
} 