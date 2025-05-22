export type UserRole = 'secretaria' | 'escola' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  schoolName?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isSecretaria: boolean;
  isAdmin: boolean;
} 