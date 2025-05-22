import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Aluno } from '@/types/alunos';
import { Turma } from '@/types/turmas';
import { Escola } from '@/types/escolas';
import { alunosService } from '@/services/alunosService';
import { turmasService } from '@/services/turmasService';
import { escolasService } from '@/services/escolasService';
import AlunosList from '@/components/alunos/AlunosList';
import AlunoForm from '@/components/alunos/AlunoForm';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImportarAlunos from '@/components/alunos/ImportarAlunos';

const Alunos = () => {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<string>('all');
  const [selectedEscola, setSelectedEscola] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let alunosData = [];
      let turmasData = [];
      let escolasData = [];

      if (user?.role === 'secretaria') {
        // Carregar escolas para o filtro
        escolasData = await escolasService.listar();
        setEscolas(escolasData);

        // Se uma escola estiver selecionada, carregar alunos e turmas dessa escola
        if (selectedEscola && selectedEscola !== 'all') {
          alunosData = await alunosService.listar(selectedEscola);
          turmasData = await turmasService.listar(selectedEscola);
        } else if (escolasData.length > 0) {
          // Se não selecionou, pega da primeira escola
          alunosData = await alunosService.listar(escolasData[0].id);
          turmasData = await turmasService.listar(escolasData[0].id);
          setSelectedEscola(escolasData[0].id);
        }
      } else if (user?.schoolId) {
        // Para usuários da escola, carregar apenas dados da própria escola
        alunosData = await alunosService.listar(user.schoolId);
        turmasData = await turmasService.listar(user.schoolId);
      }

      // Filtrar alunos por turma se uma turma específica estiver selecionada
      if (selectedTurma && selectedTurma !== 'all') {
        alunosData = alunosData.filter(aluno => aluno.turmaId === selectedTurma);
      }

      setAlunos(alunosData);
      setTurmas(turmasData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.schoolId, selectedEscola, selectedTurma]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedAluno(null);
    setShowForm(true);
  };

  const handleEdit = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setShowForm(true);
  };

  const handleDelete = async (aluno: Aluno) => {
    try {
      await alunosService.deletar(aluno.id);
      toast.success('Aluno excluído com sucesso');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir aluno');
      console.error(error);
    }
  };

  const handleSubmit = async (data: Partial<Aluno>) => {
    try {
      // Forçar matrícula numérica se fornecida
      if (data.matricula) {
        data.matricula = String(Number(data.matricula));
      }
      if (selectedAluno) {
        await alunosService.atualizar(selectedAluno.id, data);
        toast.success('Aluno atualizado com sucesso');
      } else {
        await alunosService.criar({
          ...data,
          escolaId: user?.schoolId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Omit<Aluno, 'id'>);
        toast.success('Aluno criado com sucesso');
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar aluno');
      console.error(error);
    }
  };

  const filteredAlunos = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Alunos</h1>
            <p className="text-muted-foreground">
              {user?.role === 'secretaria' 
                ? 'Gerenciamento de alunos de todas as escolas' 
                : `Gerenciamento de alunos da ${user?.schoolName || 'sua escola'}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Importar Alunos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Importar Alunos</DialogTitle>
                </DialogHeader>
                <ImportarAlunos 
                  turma={selectedTurma}
                  setTurma={setSelectedTurma}
                  onImportSuccess={() => {
                    setIsImportDialogOpen(false);
                    loadData();
                  }}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Aluno
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedAluno ? 'Editar Aluno' : 'Novo Aluno'}
                  </DialogTitle>
                </DialogHeader>
                <AlunoForm
                  turmaId={selectedTurma}
                  aluno={selectedAluno}
                  onSubmit={selectedAluno ? 
                    (data) => handleSubmit(data) : 
                    handleSubmit
                  }
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          {user?.role === 'secretaria' && (
            <div className="w-[300px]">
              <Label htmlFor="escola">Escola</Label>
              <Select value={selectedEscola} onValueChange={setSelectedEscola}>
                <SelectTrigger id="escola">
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as escolas</SelectItem>
                  {escolas.map(escola => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="w-[300px]">
            <Label htmlFor="turma">Turma</Label>
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger id="turma">
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {turmas.map(turma => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Data de Nascimento</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlunos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlunos.map((aluno) => (
                    <TableRow key={aluno.id}>
                      <TableCell>{aluno.nome}</TableCell>
                      <TableCell>{aluno.matricula}</TableCell>
                      <TableCell>
                        {new Date(aluno.dataNascimento).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{aluno.turma?.nome}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAluno(aluno);
                              setIsDialogOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(aluno)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Alunos; 