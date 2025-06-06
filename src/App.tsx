import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gabaritos from './pages/Gabaritos';
import Respostas from './pages/Respostas';
import Descritores from './pages/Descritores';
import Relatorios from './pages/Relatorios';
import Escolas from './pages/Escolas';
import Usuarios from './pages/Usuarios';
import Turmas from './pages/Turmas';
import Avaliacoes from './pages/Avaliacoes';
import NotFound from './pages/NotFound';
import Alunos from './pages/Alunos';
import RecuperarSenha from './pages/RecuperarSenha';
import RedefinirSenha from './pages/RedefinirSenha';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/gabaritos" element={<PrivateRoute><Gabaritos /></PrivateRoute>} />
              <Route path="/respostas" element={<PrivateRoute><Respostas /></PrivateRoute>} />
              <Route path="/descritores" element={<PrivateRoute><Descritores /></PrivateRoute>} />
              <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
              <Route path="/escolas" element={<PrivateRoute><Escolas /></PrivateRoute>} />
              <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
              <Route path="/turmas" element={<PrivateRoute><Turmas /></PrivateRoute>} />
              <Route path="/avaliacoes" element={<PrivateRoute><Avaliacoes /></PrivateRoute>} />
              <Route path="/alunos" element={<PrivateRoute><Alunos /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
