
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Gabaritos from "./pages/Gabaritos";
import Respostas from "./pages/Respostas";
import Descritores from "./pages/Descritores";
import Relatorios from "./pages/Relatorios";
import Escolas from "./pages/Escolas";
import Usuarios from "./pages/Usuarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/gabaritos" element={<Gabaritos />} />
            <Route path="/respostas" element={<Respostas />} />
            <Route path="/descritores" element={<Descritores />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/escolas" element={<Escolas />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
