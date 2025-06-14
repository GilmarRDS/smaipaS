import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Search, Pencil, Trash2 } from 'lucide-react';
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
  const [selectedEscola, setSelectedEscola] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const loadData = useCallback(async (escolaIdParam?: string) => {
    try {
      setLoading(true);
      let alunosData = [];
      let turmasData = [];
      let escolasData = [];
      let idParaListarAlunos: string | undefined = escolaIdParam;
      let idParaListarTurmas: string | undefined = escolaIdParam;

      if (user?.role === 'secretaria') {
        escolasData = await escolasService.listar();
        setEscolas(escolasData);

        if (escolaIdParam === undefined) {
          idParaListarAlunos = selectedEscola;
          idParaListarTurmas = selectedEscola;

          if (selectedEscola === undefined && escolasData.length > 0) {
            const primeiraEscolaId = escolasData[0].id;
            setSelectedEscola(primeiraEscolaId);
            idParaListarAlunos = primeiraEscolaId;
            idParaListarTurmas = primeiraEscolaId;
            console.log('Secretaria: Definindo escola padrão na montagem inicial:', primeiraEscolaId);
          } else if (selectedEscola === 'all') {
            idParaListarAlunos = undefined;
            idParaListarTurmas = undefined;
            console.log('Secretaria: selectedEscola é "all", listando todos.');
          } else {
            console.log('Secretaria: Usando escola selecionada do estado:', selectedEscola);
          }
        } else {
          console.log('Secretaria: Usando escolaId do parâmetro:', escolaIdParam);
        }
      } else if (user?.schoolId) {
        console.log('Usuário da Escola: Carregando alunos e turmas para escola do usuário:', user.schoolId);
        idParaListarAlunos = user.schoolId;
        idParaListarTurmas = user.schoolId;
        if (selectedEscola === undefined) {
          setSelectedEscola(user.schoolId);
        }
      } else {
        console.log('Usuário sem role ou schoolId, limpando dados.');
        setAlunos([]);
        setTurmas([]);
        setLoading(false);
        return;
      }

      if (user?.role === 'secretaria' && selectedEscola === 'all') {
        console.log('Chamando alunosService.listar sem ID (para secretaria listar todos)');
        alunosData = await alunosService.listar() as (Aluno & { turma: Turma & { escola: Escola } })[];
      } else {
        const escolaId = idParaListarAlunos || user?.schoolId;
        if (escolaId && escolaId !== 'all') {
          console.log('Chamando alunosService.listar com ID:', escolaId);
          alunosData = await alunosService.listar(escolaId) as (Aluno & { turma: Turma & { escola: Escola } })[];
          
          alunosData = alunosData.filter(aluno => 
            aluno.turma?.escola?.id === escolaId
          );
        } else {
          console.log('Nenhum ID de escola disponível para listar alunos');
          alunosData = [];
        }
      }

      if (user?.role === 'secretaria' && selectedEscola === 'all') {
        console.log('Chamando turmasService.listar sem ID (para secretaria listar todas)');
        turmasData = await turmasService.listar();
      } else {
        const escolaId = idParaListarTurmas || user?.schoolId;
        if (escolaId && escolaId !== 'all') {
          console.log('Chamando turmasService.listar com ID:', escolaId);
          turmasData = await turmasService.listar(escolaId);
          
          turmasData = turmasData.filter(turma => 
            turma.escolaId === escolaId
          );
        } else {
          console.log('Nenhum ID de escola disponível para listar turmas');
          turmasData = [];
        }
      }

      if (selectedTurma && selectedTurma !== 'all') {
        console.log('Filtrando alunos por turma localmente:', selectedTurma);
        alunosData = alunosData.filter(aluno => aluno.turmaId === selectedTurma);
      }

      setAlunos(alunosData);
      setTurmas(turmasData);
      console.log('Dados carregados e filtrados - Alunos:', alunosData.length, 'Turmas:', turmasData.length);
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
    setIsDialogOpen(true);
  };

  const handleEdit = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsDialogOpen(true);
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
      if (data.matricula) {
        data.matricula = String(Number(data.matricula));
      }
      if (selectedAluno) {
        await alunosService.atualizar(selectedAluno.id, data);
        toast.success('Aluno atualizado com sucesso');
      } else {
        if (user?.role === 'escola' && user?.schoolId) {
          data.escolaId = user.schoolId;
        } else if (user?.role === 'secretaria' && selectedEscola && selectedEscola !== 'all') {
          data.escolaId = selectedEscola;
        } else {
          console.warn('Tentativa de criar aluno sem escola associada para secretaria.');
          toast.error('Selecione uma escola antes de criar um aluno.');
          return;
        }

        await alunosService.criar({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Omit<Aluno, 'id'>);
        toast.success('Aluno criado com sucesso');
      }
      setIsDialogOpen(false);
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
                  onImportSuccess={() => {
                    setIsImportDialogOpen(false);
                    loadData();
                  }}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
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
                  escolaId={user?.role === 'secretaria' ? selectedEscola : user?.schoolId}
                  aluno={selectedAluno}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsDialogOpen(false)}
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
              <Select value={selectedEscola} onValueChange={(value: string | undefined) => setSelectedEscola(value)}>
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
            <Select value={selectedTurma} onValueChange={setSelectedTurma} disabled={user?.role === 'secretaria' && selectedEscola === 'all'}>
              <SelectTrigger id="turma">
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas
                  .filter(turma => user?.role !== 'secretaria' || selectedEscola === 'all' || turma.escolaId === selectedEscola)
                  .map(turma => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlunos.length > 0 ? (
                  filteredAlunos.map((aluno) => (
                    <TableRow key={aluno.id}>
                      <TableCell className="font-medium">{aluno.nome}</TableCell>
                      <TableCell>{aluno.matricula}</TableCell>
                      <TableCell>{aluno.turma?.nome}</TableCell>
                      <TableCell>{aluno.turma?.escola?.nome}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(aluno)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(aluno)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum aluno encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Alunos; 