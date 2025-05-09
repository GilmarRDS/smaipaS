import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import api from '../lib/api';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Enviando requisição de recuperação de senha para:', email);
      const response = await api.post('/usuarios/recuperar-senha', { email });
      console.log('Resposta da API:', response.data);
      
      toast({
        title: 'Sucesso',
        description: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.',
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error.response?.data || error.message);
      
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Ocorreu um erro ao solicitar a recuperação de senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
          <CardDescription className="text-center">
            Informe seu e-mail para receber as instruções de recuperação.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
