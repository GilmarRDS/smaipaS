import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

import { alunosService } from '../services/alunosService';
import { avaliacoesService } from '../services/avaliacoesService';
import { turmasService } from '../services/turmasService';

const alternativas = ['A', 'B', 'C', 'D', 'E'];

const Respostas: React.FC = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [file, setFile] = useState<File | null>(null);
  const [turma, setTurma] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [aluno, setAluno] = useState('');
  const [numQuestoes, setNumQuestoes] = useState(20);
  const [respostas, setRespostas] = useState<string[]>(Array(20).fill(''));
  const [ausente, setAusente] = useState(false);
  const [transferido, setTransferido] = useState(false);

  const [alunos, setAlunos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [turmas, setTurmas] = useState([]);

  useEffect(() => {
    if (turma) {
      alunosService.listarPorTurma(turma)
        .then(data => setAlunos(data))
        .catch(() => toast.error('Erro ao carregar alunos'));
    } else {
      setAlunos([]);
    }
  }, [turma]);

  useEffect(() => {
    if (turma) {
      avaliacoesService.listarPorTurma(turma)
        .then(data => setAvaliacoes(data))
        .catch(() => toast.error('Erro ao carregar avaliações'));
    } else {
      setAvaliacoes([]);
    }
  }, [turma]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success('Arquivo selecionado com sucesso');
    }
  };

  const handleImportar = () => {
    if (!file) {
      toast.error('Selecione um arquivo para importar');
      return;
    }

    if (!turma || !avaliacao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    toast.success('Respostas importadas com sucesso!');
    setFile(null);
  };

  const handleAlunoChange = (value: string) => {
    setAluno(value);
    setAusente(false);
    setTransferido(false);
    setRespostas(Array(numQuestoes).fill(''));
  };

  const handleRespostaChange = (index: number, value: string) => {
    const newRespostas = [...respostas];
    newRespostas[index] = value;
    setRespostas(newRespostas);
  };

  const handleAusenteChange = (checked: boolean) => {
    setAusente(checked);
    if (checked) {
      setTransferido(false);
      setRespostas(Array(numQuestoes).fill(''));
    }
  };

  const handleTransferidoChange = (checked: boolean) => {
    setTransferido(checked);
    if (checked) {
      setAusente(false);
      setRespostas(Array(numQuestoes).fill(''));
    }
  };

  const handleSalvarRespostas = () => {
    if (!turma || !avaliacao || !aluno) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!ausente && !transferido && respostas.some(resp => resp === '')) {
      toast.error('Preencha todas as respostas do aluno ou marque como ausente/transferido');
      return;
    }

    toast.success('Respostas cadastradas com sucesso!');
    setRespostas(Array(numQuestoes).fill(''));
    setAusente(false);
    setTransferido(false);
    setAluno('');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Respostas dos Alunos</h1>
          <p className="text-muted-foreground">
            Registre as respostas dos alunos nas avaliações
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Registro Individual</TabsTrigger>
            <TabsTrigger value="importar">Importar Respostas</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registro Individual de Respostas</CardTitle>
                <CardDescription>
                  Registre as respostas de cada aluno individualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="turma-individual">Turma</Label>
                    <Select value={turma} onValueChange={setTurma}>
                      <SelectTrigger id="turma-individual">
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                    <SelectContent>
                      {turmas.map(turma => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avaliacao-individual">Avaliação</Label>
                    <Select value={avaliacao} onValueChange={setAvaliacao}>
                      <SelectTrigger id="avaliacao-individual">
                        <SelectValue placeholder="Selecione a avaliação" />
                      </SelectTrigger>
                      <SelectContent>
                        {avaliacoes.map(av => (
                          <SelectItem key={av.id} value={av.id}>{av.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aluno-individual">Aluno</Label>
                    <Select
                      value={aluno}
                      onValueChange={handleAlunoChange}
                      disabled={!turma || !avaliacao}
                    >
                      <SelectTrigger id="aluno-individual">
                        <SelectValue placeholder="Selecione o aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {alunos.map(al => (
                          <SelectItem key={al.id} value={al.id}>
                            {al.numero} - {al.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {turma && avaliacao && aluno && (
                  <>
                    <div className="flex items-center space-x-6 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ausente"
                          checked={ausente}
                          onCheckedChange={handleAusenteChange}
                          disabled={transferido}
                        />
                        <Label htmlFor="ausente" className="cursor-pointer">Aluno ausente</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="transferido"
                          checked={transferido}
                          onCheckedChange={handleTransferidoChange}
                          disabled={ausente}
                        />
                        <Label htmlFor="transferido" className="cursor-pointer">Aluno transferido</Label>
                      </div>
                    </div>

                    {!ausente && !transferido && (
                      <div className="border rounded-md p-4">
                        <h3 className="text-sm font-medium mb-4">Respostas do aluno:</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {respostas.map((resp, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="font-medium w-8">Q{index + 1}:</span>
                              <Select value={resp} onValueChange={(value) => handleRespostaChange(index, value)}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="?" />
                                </SelectTrigger>
                                <SelectContent>
                                  {alternativas.map(letra => (
                                    <SelectItem key={letra} value={letra}>{letra}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleSalvarRespostas}
                      className="w-full"
                      disabled={!turma || !avaliacao || !aluno || (!ausente && !transferido && respostas.some(resp => resp === ''))}
                    >
                      Salvar Respostas
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="importar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importar Respostas via Excel</CardTitle>
                <CardDescription>
                  Faça upload de uma planilha Excel contendo as respostas dos alunos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="turma-import">Turma</Label>
                  <Select value={turma} onValueChange={setTurma}>
                    <SelectTrigger id="turma-import">
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map(turma => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="avaliacao-import">Avaliação</Label>
                    <Select value={avaliacao} onValueChange={setAvaliacao}>
                      <SelectTrigger id="avaliacao-import">
                        <SelectValue placeholder="Selecione a avaliação" />
                      </SelectTrigger>
                      <SelectContent>
                        {avaliacoes.map(av => (
                          <SelectItem key={av.id} value={av.id}>{av.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Arquivo de Respostas (Excel)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                    />
                    <Button
                      onClick={handleImportar}
                      disabled={!file || !turma || !avaliacao}
                      className="whitespace-nowrap"
                    >
                      Importar Respostas
                    </Button>
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {file.name}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Instruções para importação:</h3>
                  <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                    <li>O arquivo deve estar no formato Excel (.xlsx, .xls) ou CSV (.csv)</li>
                    <li>A primeira coluna deve conter o número do aluno</li>
                    <li>A segunda coluna deve conter o nome do aluno</li>
                    <li>As colunas seguintes devem conter as respostas para cada questão</li>
                    <li>Para alunos ausentes, use "F" em todas as respostas</li>
                    <li>Para alunos transferidos, use "T" em todas as respostas</li>
                    <li>Utilize a planilha modelo disponível para <a href="#" className="text-blue-600 underline">download</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consulta de Respostas</CardTitle>
                <CardDescription>
                  Visualize as respostas já registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alunos.slice(0, 5).map((aluno) => (
                        <TableRow key={aluno.id}>
                          <TableCell>{aluno.numero}</TableCell>
                          <TableCell className="font-medium">{aluno.nome}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Respondido
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">Visualizar</Button>
                              <Button variant="outline" size="sm">Editar</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Respostas;
