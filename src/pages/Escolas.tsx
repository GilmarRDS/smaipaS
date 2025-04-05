
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { School, PenSquare, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Tipos
interface Escola {
  id: string;
  nome: string;
  inep: string;
  endereco: string;
  telefone: string;
  diretor: string;
}

// Mock de dados iniciais
const ESCOLAS_MOCK: Escola[] = [
  {
    id: 'escola-1',
    nome: 'Escola Municipal A',
    inep: '12345678',
    endereco: 'Rua das Flores, 123',
    telefone: '(11) 1234-5678',
    diretor: 'Ana Silva',
  },
  {
    id: 'escola-2',
    nome: 'Escola Municipal B',
    inep: '87654321',
    endereco: 'Av. Principal, 456',
    telefone: '(11) 8765-4321',
    diretor: 'João Santos',
  },
];

const Escolas = () => {
  const { isSecretaria } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>(ESCOLAS_MOCK);
  const [open, setOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
  
  // Form state
  const [nome, setNome] = useState('');
  const [inep, setInep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [diretor, setDiretor] = useState('');

  // Se não for da secretaria, redirecionar
  if (!isSecretaria) {
    toast.error('Acesso restrito à Secretaria de Educação');
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpenForm = (escola?: Escola) => {
    if (escola) {
      setEditingEscola(escola);
      setNome(escola.nome);
      setInep(escola.inep);
      setEndereco(escola.endereco);
      setTelefone(escola.telefone);
      setDiretor(escola.diretor);
    } else {
      setEditingEscola(null);
      setNome('');
      setInep('');
      setEndereco('');
      setTelefone('');
      setDiretor('');
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!nome || !inep) {
      toast.error('Nome e código INEP são obrigatórios');
      return;
    }

    // Se estiver editando
    if (editingEscola) {
      const updatedEscolas = escolas.map(esc => 
        esc.id === editingEscola.id 
          ? { ...esc, nome, inep, endereco, telefone, diretor }
          : esc
      );
      setEscolas(updatedEscolas);
      toast.success('Escola atualizada com sucesso!');
    } else {
      // Adicionando nova escola
      const newEscola: Escola = {
        id: `escola-${Date.now()}`, // Gera ID único
        nome,
        inep,
        endereco,
        telefone,
        diretor
      };
      setEscolas([...escolas, newEscola]);
      toast.success('Escola cadastrada com sucesso!');
    }
    
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta escola?')) {
      setEscolas(escolas.filter(escola => escola.id !== id));
      toast.success('Escola excluída com sucesso!');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Escolas</h1>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Escola
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingEscola ? 'Editar Escola' : 'Cadastrar Nova Escola'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da escola. O código INEP é utilizado para identificação única da escola.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="inep" className="text-right">
                      Código INEP
                    </Label>
                    <Input
                      id="inep"
                      value={inep}
                      onChange={(e) => setInep(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endereco" className="text-right">
                      Endereço
                    </Label>
                    <Input
                      id="endereco"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="telefone" className="text-right">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="diretor" className="text-right">
                      Diretor(a)
                    </Label>
                    <Input
                      id="diretor"
                      value={diretor}
                      onChange={(e) => setDiretor(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingEscola ? 'Salvar Alterações' : 'Cadastrar Escola'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Escolas</CardTitle>
          </CardHeader>
          <CardContent>
            {escolas.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Nenhuma escola cadastrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código INEP</TableHead>
                    <TableHead>Diretor(a)</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escolas.map((escola) => (
                    <TableRow key={escola.id}>
                      <TableCell className="font-medium">{escola.nome}</TableCell>
                      <TableCell>{escola.inep}</TableCell>
                      <TableCell>{escola.diretor}</TableCell>
                      <TableCell>{escola.telefone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenForm(escola)}
                          >
                            <PenSquare className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => handleDelete(escola.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Escolas;
