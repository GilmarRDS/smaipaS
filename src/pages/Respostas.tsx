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
import { AxiosError } from 'axios';

import { alunosService } from '../services/alunosService';
import { avaliacoesService } from '../services/avaliacoesService';
import { turmasService } from '../services/turmasService';
import { escolasService } from '../services/escolasService';
import useAuth from '@/hooks/useAuth';
import { Escola } from '@/types/escolas';
import { Turma } from '@/types/turmas';
import { Avaliacao } from '@/types/avaliacoes';
import { Aluno, RespostaAluno } from '@/types/alunos';
import { RespostaCard } from '@/components/respostas/RespostaCard';

const alternativas = ['A', 'B', 'C', 'D', 'E'];

interface AlunoComRespostas extends Aluno {
  numero: number;
  respostas: string[];
  ausente: boolean;
  transferido: boolean;
}

const Respostas: React.FC = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [file, setFile] = useState<File | null>(null);
  const [turma, setTurma] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [numQuestoes, setNumQuestoes] = useState(10);
  const [escola, setEscola] = useState('');

  const [alunos, setAlunos] = useState<AlunoComRespostas[]>([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [gabarito, setGabarito] = useState<string[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'secretaria') {
      escolasService.listar()
        .then(data => setEscolas(data))
        .catch(() => toast.error('Erro ao carregar escolas'));
    } else if (user?.schoolId) {
      setEscola(user.schoolId);
    }
  }, [user]);

  useEffect(() => {
    const escolaIdParaCarregarTurmas = user?.role === 'secretaria' ? escola : user?.schoolId;
    if (escolaIdParaCarregarTurmas) {
      turmasService.listar(escolaIdParaCarregarTurmas)
        .then(data => { setTurmas(data); })
        .catch(() => toast.error('Erro ao carregar turmas'));
    } else {
      setTurmas([]);
    }
    setTurma('');
    setAvaliacao('');
  }, [escola, user]);

  useEffect(() => {
    if (turma) {
      alunosService.listarPorTurma(turma)
        .then(async data => {
          const alunosComRespostas = await Promise.all(data.map(async (aluno: Aluno, index: number) => {
            let respostas = Array(numQuestoes).fill('');
            let ausente = false;
            let transferido = false;
            
            // Se tiver avaliação selecionada, busca as respostas existentes
            if (avaliacao) {
              try {
                const respostaAluno = await alunosService.obterRespostas(aluno.id, avaliacao);
                if (respostaAluno) {
                  ausente = !respostaAluno.compareceu && !respostaAluno.transferido;
                  transferido = respostaAluno.transferido;
                  if (respostaAluno.itens && respostaAluno.itens.length > 0) {
                    // Garante que o array de respostas tenha o tamanho correto
                    const novasRespostas = Array(numQuestoes).fill('');
                    respostaAluno.itens.forEach(item => {
                      if (item.numero <= numQuestoes) {
                        novasRespostas[item.numero - 1] = item.resposta;
                      }
                    });
                    respostas = novasRespostas;
                  }
                }
              } catch (error) {
                console.error(`Erro ao carregar respostas do aluno ${aluno.nome}:`, error);
              }
            }

            return {
              ...aluno,
              numero: index + 1,
              respostas,
              ausente,
              transferido,
            };
          }));
          setAlunos(alunosComRespostas);
        })
        .catch(() => toast.error('Erro ao carregar alunos'));
    } else {
      setAlunos([]);
    }
  }, [turma, numQuestoes, avaliacao]);

  useEffect(() => {
    if (turma) {
      avaliacoesService.listarPorTurma(turma)
        .then(data => { setAvaliacoes(data); console.log('Avaliações carregadas:', data); })
        .catch(() => toast.error('Erro ao carregar avaliações'));
    } else {
      setAvaliacoes([]);
    }
  }, [turma]);

  useEffect(() => {
    if (avaliacao) {
      avaliacoesService.obterGabarito(avaliacao)
        .then(data => {
          if (data && data.itens) {
            const respostasCorretas = Array(numQuestoes).fill('');
            data.itens.forEach(item => {
              if (item.numero <= numQuestoes) {
                respostasCorretas[item.numero - 1] = item.resposta;
              }
            });
            setGabarito(respostasCorretas);
          }
        })
        .catch(error => {
          console.error('Erro ao carregar gabarito:', error);
          toast.error('Erro ao carregar gabarito');
        });
    } else {
      setGabarito([]);
    }
  }, [avaliacao, numQuestoes]);

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

  const handleRespostaChange = (alunoId: string, questaoIndex: number, value: string) => {
    if (!['A', 'B', 'C', 'D', 'E'].includes(value)) {
      toast.error('Resposta inválida. Use apenas A, B, C, D ou E.');
      return;
    }
    setAlunos(prevAlunos =>
      prevAlunos.map(aluno =>
        aluno.id === alunoId
          ? { ...aluno, respostas: aluno.respostas.map((resp, i) => (i === questaoIndex ? value : resp)) }
          : aluno
      )
    );
  };

  const handleAusenteChange = (alunoId: string, checked: boolean) => {
    setAlunos(prevAlunos =>
      prevAlunos.map(aluno =>
        aluno.id === alunoId
          ? { ...aluno, ausente: checked, transferido: checked ? false : aluno.transferido, respostas: checked ? Array(numQuestoes).fill('') : aluno.respostas }
          : aluno
      )
    );
  };

  const handleTransferidoChange = (alunoId: string, checked: boolean) => {
    setAlunos(prevAlunos =>
      prevAlunos.map(aluno =>
        aluno.id === alunoId
          ? { ...aluno, transferido: checked, ausente: checked ? false : aluno.ausente, respostas: checked ? Array(numQuestoes).fill('') : aluno.respostas }
          : aluno
      )
    );
  };

  const handleSalvarRespostaAluno = async (aluno: AlunoComRespostas) => {
    if (!turma || !avaliacao) {
      toast.error('Selecione a Turma e a Avaliação antes de salvar.');
      return;
    }

    if (!aluno.ausente && !aluno.transferido) {
      if (aluno.respostas.some(resp => !resp)) {
        toast.error(`Preencha todas as respostas para o aluno ${aluno.numero} - ${aluno.nome} ou marque como ausente/transferido.`);
        return;
      }

      if (aluno.respostas.length !== numQuestoes) {
        toast.error(`O número de respostas (${aluno.respostas.length}) não corresponde ao número de questões (${numQuestoes}) para o aluno ${aluno.numero} - ${aluno.nome}.`);
        return;
      }

      const respostasInvalidas = aluno.respostas.filter(resp => !['A', 'B', 'C', 'D', 'E'].includes(resp));
      if (respostasInvalidas.length > 0) {
        toast.error(`Todas as respostas devem ser A, B, C, D ou E para o aluno ${aluno.numero} - ${aluno.nome}.`);
        return;
      }
    }

    try {
      console.log(`Salvando respostas para o aluno ${aluno.numero} - ${aluno.nome}`);
      await alunosService.salvarRespostas({
        alunoId: aluno.id,
        avaliacaoId: avaliacao,
        compareceu: !aluno.ausente && !aluno.transferido,
        transferido: aluno.transferido,
        itens: (!aluno.ausente && !aluno.transferido)
          ? aluno.respostas.map((resposta, index) => ({
              numero: index + 1,
              resposta
            }))
          : [],
      });
      toast.success(`Respostas salvas com sucesso para o aluno ${aluno.numero} - ${aluno.nome}.`);
      console.log(`Respostas salvas com sucesso para o aluno ${aluno.numero} - ${aluno.nome}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error(`Erro ao salvar respostas para o aluno ${aluno.numero} - ${aluno.nome}:`, errorMessage);
        toast.error(`Erro ao salvar respostas para o aluno ${aluno.numero} - ${aluno.nome}: ${errorMessage}`);
      } else {
        console.error(`Erro desconhecido ao salvar respostas para o aluno ${aluno.numero} - ${aluno.nome}:`, error);
        toast.error(`Erro ao salvar respostas para o aluno ${aluno.numero} - ${aluno.nome}.`);
      }
    }
  };

  const renderAlunosRespostas = () => {
    if (!turma || !avaliacao || alunos.length === 0) {
      return <p>Selecione uma turma e avaliação para visualizar os alunos e registrar respostas.</p>;
    }

    return (
      <div className="space-y-6">
        {alunos.map(aluno => (
          <RespostaCard
            key={aluno.id}
            aluno={aluno}
            numQuestoes={numQuestoes}
            gabarito={gabarito}
            onSave={async (alunoId, respostas, ausente, transferido) => {
              const alunoToSave = alunos.find(a => a.id === alunoId);
              if (!alunoToSave) return;

              await alunosService.salvarRespostas({
                alunoId,
                avaliacaoId: avaliacao,
                compareceu: !ausente && !transferido,
                transferido,
                itens: (!ausente && !transferido)
                  ? respostas.map((resposta, index) => ({
                      numero: index + 1,
                      resposta
                    }))
                  : [],
              });

              // Update local state
              setAlunos(prevAlunos =>
                prevAlunos.map(a =>
                  a.id === alunoId
                    ? { ...a, respostas, ausente, transferido }
                    : a
                )
              );
            }}
            onAusenteChange={handleAusenteChange}
            onTransferidoChange={handleTransferidoChange}
          />
        ))}
      </div>
    );
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individual">Registro Individual</TabsTrigger>
            <TabsTrigger value="importar">Importar Respostas</TabsTrigger>
            <TabsTrigger value="quantitativo">Análise Quantitativa</TabsTrigger>
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
                  {user?.role === 'secretaria' && (
                    <div className="space-y-2">
                      <Label htmlFor="escola-individual">Escola</Label>
                      <Select value={escola} onValueChange={setEscola}>
                        <SelectTrigger id="escola-individual">
                          <SelectValue placeholder="Selecione a escola" />
                        </SelectTrigger>
                        <SelectContent>
                          {escolas.map(esc => (
                            <SelectItem key={esc.id} value={esc.id}>
                              {esc.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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
                </div>

                {renderAlunosRespostas()}

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

          <TabsContent value="quantitativo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise Quantitativa de Respostas</CardTitle>
                <CardDescription>
                  Visualize o quantitativo de respostas corretas por aluno
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {user?.role === 'secretaria' && (
                      <div className="space-y-2">
                        <Label htmlFor="escola-quantitativo">Escola</Label>
                        <Select value={escola} onValueChange={setEscola}>
                          <SelectTrigger id="escola-quantitativo">
                            <SelectValue placeholder="Selecione a escola" />
                          </SelectTrigger>
                          <SelectContent>
                            {escolas.map(esc => (
                              <SelectItem key={esc.id} value={esc.id}>
                                {esc.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="turma-quantitativo">Turma</Label>
                      <Select value={turma} onValueChange={setTurma}>
                        <SelectTrigger id="turma-quantitativo">
                          <SelectValue placeholder="Selecione a turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {turmas.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avaliacao-quantitativo">Avaliação</Label>
                      <Select value={avaliacao} onValueChange={setAvaliacao}>
                        <SelectTrigger id="avaliacao-quantitativo">
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

                  {turma && avaliacao && alunos.length > 0 && (
                    <div className="mt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Número</TableHead>
                            <TableHead>Nome do Aluno</TableHead>
                            <TableHead className="text-right">Total de Questões</TableHead>
                            <TableHead className="text-right">Acertos</TableHead>
                            <TableHead className="text-right">Percentual</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alunos.map(aluno => {
                            const acertos = aluno.respostas.filter((resposta, index) => 
                              resposta === gabarito[index]
                            ).length;
                            const percentual = (acertos / numQuestoes) * 100;
                            const status = aluno.ausente ? 'Ausente' : 
                                         aluno.transferido ? 'Transferido' :
                                         `${acertos}/${numQuestoes}`;

                            return (
                              <TableRow key={aluno.id}>
                                <TableCell>{aluno.numero}</TableCell>
                                <TableCell>{aluno.nome}</TableCell>
                                <TableCell className="text-right">{numQuestoes}</TableCell>
                                <TableCell className="text-right">{acertos}</TableCell>
                                <TableCell className="text-right">
                                  <span className={`px-2 py-1 rounded-full ${
                                    aluno.ausente || aluno.transferido ? 'bg-gray-100 text-gray-800' :
                                    percentual >= 70 ? 'bg-green-100 text-green-800' :
                                    percentual >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {aluno.ausente || aluno.transferido ? '-' : `${percentual.toFixed(1)}%`}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className={`px-2 py-1 rounded-full ${
                                    aluno.ausente ? 'bg-gray-100 text-gray-800' :
                                    aluno.transferido ? 'bg-blue-100 text-blue-800' :
                                    percentual >= 70 ? 'bg-green-100 text-green-800' :
                                    percentual >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {status}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
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
