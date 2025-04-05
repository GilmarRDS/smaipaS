
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Users, PenSquare, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Tipos
interface Turma {
  id: string;
  nome: string;
  ano: string;
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  escola: string;
  escolaId: string;
}

// Mock de escolas
interface Escola {
  id: string;
  nome: string;
}

// Mock de turmas iniciais
const TURMAS_MOCK: Turma[] = [
  {
    id: 'turma-1',
    nome: '1º Ano A',
    ano: '1',
    turno: 'matutino',
    escola: 'Escola Municipal A',
    escolaId: 'escola-1',
  },
  {
    id: 'turma-2',
    nome: '2º Ano B',
    ano: '2',
    turno: 'vespertino',
    escola: 'Escola Municipal A',
    escolaId: 'escola-1',
  },
  {
    id: 'turma-3',
    nome: '3º Ano C',
    ano: '3',
    turno: 'matutino',
    escola: 'Escola Municipal B',
    escolaId: 'escola-2',
  },
];

// Mock de escolas
const ESCOLAS_MOCK: Escola[] = [
  { id: 'escola-1', nome: 'Escola Municipal A' },
  { id: 'escola-2', nome: 'Escola Municipal B' },
];

const Turmas = () => {
  const { user, isSecretaria } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>(TURMAS_MOCK);
  const [open, setOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  
  // Form state
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');
  const [turno, setTurno] = useState<'matutino' | 'vespertino' | 'noturno' | 'integral'>('matutino');
  const [escolaId, setEscolaId] = useState('');

  // Filtrar turmas por escola se for usuário de escola
  const turmasFiltradas = isSecretaria 
    ? turmas 
    : turmas.filter(turma => turma.escolaId === user?.schoolId);

  // Escolas disponíveis para seleção (apenas para secretaria)
  const escolasDisponiveis = isSecretaria 
    ? ESCOLAS_MOCK 
    : ESCOLAS_MOCK.filter(escola => escola.id === user?.schoolId);

  const handleOpenForm = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
      setNome(turma.nome);
      setAno(turma.ano);
      setTurno(turma.turno);
      setEscolaId(turma.escolaId);
    } else {
      setEditingTurma(null);
      setNome('');
      setAno('');
      setTurno('matutino');
      // Para usuários de escola, pré-seleciona a escola do usuário
      setEscolaId(isSecretaria ? '' : (user?.schoolId || ''));
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!nome || !ano || !turno) {
      toast.error('Nome, ano e turno são obrigatórios');
      return;
    }

    if (!escolaId) {
      toast.error('Selecione uma escola');
      return;
    }

    // Encontrar o nome da escola
    const selectedSchool = ESCOLAS_MOCK.find(escola => escola.id === escolaId);
    
    if (!selectedSchool) {
      toast.error('Escola não encontrada');
      return;
    }

    // Se estiver editando
    if (editingTurma) {
      const updatedTurmas = turmas.map(t => 
        t.id === editingTurma.id 
          ? { 
              ...t, 
              nome, 
              ano, 
              turno,
              escolaId,
              escola: selectedSchool.nome
            }
          : t
      );
      setTurmas(updatedTurmas);
      toast.success('Turma atualizada com sucesso!');
    } else {
      // Adicionando nova turma
      const newTurma: Turma = {
        id: `turma-${Date.now()}`, // Gera ID único
        nome,
        ano,
        turno,
        escolaId,
        escola: selectedSchool.nome
      };
      setTurmas([...turmas, newTurma]);
      toast.success('Turma cadastrada com sucesso!');
    }
    
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      setTurmas(turmas.filter(turma => turma.id !== id));
      toast.success('Turma excluída com sucesso!');
    }
  };

  // Lista de anos escolares disponíveis
  const anosEscolares = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Turmas</h1>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingTurma ? 'Editar Turma' : 'Cadastrar Nova Turma'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da turma. Todas as informações são necessárias para o cadastro.
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
                      placeholder="Ex: 1º Ano A"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ano" className="text-right">
                      Ano
                    </Label>
                    <Select 
                      value={ano} 
                      onValueChange={setAno}
                    >
                      <SelectTrigger id="ano" className="col-span-3">
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {anosEscolares.map((anoEscolar) => (
                          <SelectItem key={anoEscolar} value={anoEscolar}>
                            {anoEscolar}º Ano
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="turno" className="text-right">
                      Turno
                    </Label>
                    <Select 
                      value={turno} 
                      onValueChange={(value: 'matutino' | 'vespertino' | 'noturno' | 'integral') => setTurno(value)}
                    >
                      <SelectTrigger id="turno" className="col-span-3">
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="matutino">Matutino</SelectItem>
                        <SelectItem value="vespertino">Vespertino</SelectItem>
                        <SelectItem value="noturno">Noturno</SelectItem>
                        <SelectItem value="integral">Integral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="escola" className="text-right">
                      Escola
                    </Label>
                    <Select 
                      value={escolaId} 
                      onValueChange={setEscolaId}
                      disabled={!isSecretaria && escolasDisponiveis.length === 1}
                    >
                      <SelectTrigger id="escola" className="col-span-3">
                        <SelectValue placeholder="Selecione a escola" />
                      </SelectTrigger>
                      <SelectContent>
                        {escolasDisponiveis.map((escola) => (
                          <SelectItem key={escola.id} value={escola.id}>
                            {escola.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTurma ? 'Salvar Alterações' : 'Cadastrar Turma'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Turmas</CardTitle>
          </CardHeader>
          <CardContent>
            {turmasFiltradas.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Nenhuma turma cadastrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turmasFiltradas.map((turma) => (
                    <TableRow key={turma.id}>
                      <TableCell className="font-medium">{turma.nome}</TableCell>
                      <TableCell>{turma.ano}º Ano</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          turma.turno === 'matutino' 
                            ? 'bg-blue-100 text-blue-800' 
                            : turma.turno === 'vespertino'
                            ? 'bg-orange-100 text-orange-800'
                            : turma.turno === 'noturno'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {turma.turno === 'matutino' ? 'Matutino' : 
                           turma.turno === 'vespertino' ? 'Vespertino' : 
                           turma.turno === 'noturno' ? 'Noturno' : 'Integral'}
                        </span>
                      </TableCell>
                      <TableCell>{turma.escola}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenForm(turma)}
                          >
                            <PenSquare className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => handleDelete(turma.id)}
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

export default Turmas;
