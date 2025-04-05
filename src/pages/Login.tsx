
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockKeyhole, Mail, School } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center login-gradient p-4">
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <School className="h-14 w-14 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SMAIPA</h1>
        </div>
        
        <Card className="login-card border-none bg-white/80">
          <CardHeader>
            <CardTitle className="text-center text-smaipa-800">Acesso ao Sistema</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-smaipa-800">E-mail</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-4 w-4 text-smaipa-600" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-smaipa-200 focus:border-smaipa-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-smaipa-800">Senha</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockKeyhole className="h-4 w-4 text-smaipa-600" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    className="pl-10 border-smaipa-200 focus:border-smaipa-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-smaipa-600 hover:bg-smaipa-700 text-white" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Aguarde...' : 'Entrar'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      <div className="mt-8 text-center text-white/60 text-sm">
        © 2025 SMAIPA - Todos os direitos reservados
      </div>
    </div>
  );
};

export default Login;
