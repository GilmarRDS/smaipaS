
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckCircle2, ClipboardList, PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { AVALIACOES_MOCK, Avaliacao, getStatusColor, formatStatus } from '@/types/avaliacoes';
import { useAuth } from '@/contexts/AuthContext';
import { ANOS_ESCOLARES } from '@/types/turmas';
import { cn } from '@/lib/utils';

const Avaliacoes: React.FC = () => {
  const { isSecretaria } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(AVALIACOES_MOCK);
  const [activeTab, setActiveTab] = useState<string>('todas');
  const [open, setOpen] = useState<boolean>(false);

  // Form states
  const [nome, setNome] = useState<string>('');
  const [componente, setComponente] = useState<'portugues' | 'matematica'>('portugues');
  const [ano, setAno] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);
  const [numQuestoes, setNumQuestoes] = useState<string>('20');

  const handleAddAvaliacao = () => {
    if (!nome || !componente || !ano || !dataInicio || !dataFim || !numQuestoes) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const novaAvaliacao: Avaliacao = {
      id: `aval-${avaliacoes.length + 1}`,
      nome,
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0],
      componente,
      ano,
      numQuestoes: parseInt(numQuestoes, 10),
      status: 'agendada',
    };

    setAvaliacoes([...avaliacoes, novaAvaliacao]);
    toast.success('Avaliação cadastrada com sucesso!');
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setNome('');
    setComponente('portugues');
    setAno('');
    setDataInicio(undefined);
    setDataFim(undefined);
    setNumQuestoes('20');
  };

  const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
    if (activeTab === 'todas') return true;
    return avaliacao.status === activeTab;
  });

  const handleStatusChange = (avaliacaoId: string, novoStatus: Avaliacao['status']) => {
    setAvaliacoes(avaliacoes.map(avaliacao => 
      avaliacao.id === avaliacaoId ? { ...avaliacao, status: novoStatus } : avaliacao
    ));
    toast.success(`Status da avaliação atualizado para ${formatStatus(novoStatus)}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
            <p className="text-muted-foreground">
              Gerencie as avaliações aplicadas ou a serem aplicadas
            </p>
          </div>
          {isSecretaria && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nova Avaliação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Avaliação</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova avaliação a ser aplicada
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome da Avaliação</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Diagnóstica Inicial - Português - 5º Ano"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="componente">Componente Curricular</Label>
                      <Select value={componente} onValueChange={(value: 'portugues' | 'matematica') => setComponente(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portugues">Língua Portuguesa</SelectItem>
                          <SelectItem value="matematica">Matemática</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ano">Ano Escolar</Label>
                      <Select value={ano} onValueChange={setAno}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {ANOS_ESCOLARES.map((anoOpt) => (
                            <SelectItem key={anoOpt} value={anoOpt}>{anoOpt}º Ano</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dataInicio && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dataInicio}
                            onSelect={setDataInicio}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dataFim">Data de Término</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dataFim && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dataFim ? format(dataFim, "dd/MM/yyyy") : "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dataFim}
                            onSelect={setDataFim}
                            initialFocus
                            disabled={(date) => dataInicio ? date < dataInicio : false}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="numQuestoes">Número de Questões</Label>
                    <Select value={numQuestoes} onValueChange={setNumQuestoes}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 questões</SelectItem>
                        <SelectItem value="15">15 questões</SelectItem>
                        <SelectItem value="20">20 questões</SelectItem>
                        <SelectItem value="25">25 questões</SelectItem>
                        <SelectItem value="30">30 questões</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddAvaliacao}>Cadastrar Avaliação</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="agendada">Agendadas</TabsTrigger>
            <TabsTrigger value="em-andamento">Em Andamento</TabsTrigger>
            <TabsTrigger value="concluida">Concluídas</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avaliações {activeTab !== 'todas' ? formatStatus(activeTab as Avaliacao['status']) : ''}</CardTitle>
                <CardDescription>
                  Gerencie as avaliações e seus respectivos status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredAvaliacoes.length === 0 ? (
                  <div className="text-center py-6">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">Nenhuma avaliação encontrada</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeTab === 'todas' 
                        ? 'Não há avaliações cadastradas no sistema.' 
                        : `Não há avaliações com status "${formatStatus(activeTab as Avaliacao['status'])}" no momento.`}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Componente</TableHead>
                          <TableHead>Ano</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead className="text-center">Questões</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAvaliacoes.map((avaliacao) => (
                          <TableRow key={avaliacao.id}>
                            <TableCell className="font-medium">{avaliacao.nome}</TableCell>
                            <TableCell>
                              {avaliacao.componente === 'portugues' ? 'Língua Portuguesa' : 'Matemática'}
                            </TableCell>
                            <TableCell>{avaliacao.ano}º Ano</TableCell>
                            <TableCell>
                              {format(new Date(avaliacao.dataInicio), 'dd/MM/yyyy')} a {' '}
                              {format(new Date(avaliacao.dataFim), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="text-center">{avaliacao.numQuestoes}</TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(avaliacao.status)}`}>
                                {formatStatus(avaliacao.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {isSecretaria && avaliacao.status === 'agendada' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleStatusChange(avaliacao.id, 'em-andamento')}
                                  >
                                    Iniciar
                                  </Button>
                                )}
                                {isSecretaria && avaliacao.status === 'em-andamento' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleStatusChange(avaliacao.id, 'concluida')}
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Finalizar
                                  </Button>
                                )}
                                <Button variant="outline" size="sm">Ver Detalhes</Button>
                                {isSecretaria && avaliacao.status !== 'concluida' && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => {
                                      if (avaliacao.status !== 'cancelada') {
                                        handleStatusChange(avaliacao.id, 'cancelada');
                                      } else {
                                        handleStatusChange(avaliacao.id, 'agendada');
                                      }
                                    }}
                                  >
                                    {avaliacao.status === 'cancelada' ? 'Restaurar' : 'Cancelar'}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Avaliacoes;
