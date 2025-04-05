
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

// Mock de gabaritos para demonstração
const MOCK_GABARITOS = [
  { id: '1', avaliacao: 'Diagnóstica Inicial - Português - 5º Ano', data: '2024-02-15', questoes: 20 },
  { id: '2', avaliacao: 'Diagnóstica Inicial - Matemática - 5º Ano', data: '2024-02-16', questoes: 20 },
  { id: '3', avaliacao: 'Diagnóstica Inicial - Português - 9º Ano', data: '2024-02-17', questoes: 25 },
  { id: '4', avaliacao: 'Diagnóstica Inicial - Matemática - 9º Ano', data: '2024-02-18', questoes: 25 },
];

const alternativas = ['A', 'B', 'C', 'D', 'E'];

const Gabaritos: React.FC = () => {
  const [activeTab, setActiveTab] = useState('importar');
  const [file, setFile] = useState<File | null>(null);
  const [turma, setTurma] = useState('');
  const [componente, setComponente] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [numQuestoes, setNumQuestoes] = useState('20');
  const [gabarito, setGabarito] = useState<string[]>(Array(20).fill(''));
  
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
    
    if (!turma || !componente || !avaliacao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Simulação de importação bem-sucedida
    toast.success('Gabarito importado com sucesso!');
    setFile(null);
  };
  
  const handleNumQuestoesChange = (value: string) => {
    const num = parseInt(value, 10);
    setNumQuestoes(value);
    setGabarito(Array(num).fill(''));
  };
  
  const handleAlternativaChange = (index: number, value: string) => {
    const newGabarito = [...gabarito];
    newGabarito[index] = value;
    setGabarito(newGabarito);
  };
  
  const handleSalvarGabarito = () => {
    if (!turma || !componente || !avaliacao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (gabarito.some(alt => alt === '')) {
      toast.error('Preencha todas as alternativas do gabarito');
      return;
    }
    
    // Simulação de salvamento bem-sucedido
    toast.success('Gabarito cadastrado com sucesso!');
    setGabarito(Array(parseInt(numQuestoes, 10)).fill(''));
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gabaritos</h1>
          <p className="text-muted-foreground">
            Gerencie os gabaritos das avaliações aplicadas
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="importar">Importar Gabarito</TabsTrigger>
            <TabsTrigger value="cadastrar">Cadastrar Gabarito</TabsTrigger>
            <TabsTrigger value="consultar">Consultar Gabaritos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="importar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importar Gabarito via Excel</CardTitle>
                <CardDescription>
                  Faça upload de uma planilha Excel contendo o gabarito da avaliação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="turma-import">Turma</Label>
                    <Select value={turma} onValueChange={setTurma}>
                      <SelectTrigger id="turma-import">
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5-ano">5º Ano</SelectItem>
                        <SelectItem value="9-ano">9º Ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="componente-import">Componente Curricular</Label>
                    <Select value={componente} onValueChange={setComponente}>
                      <SelectTrigger id="componente-import">
                        <SelectValue placeholder="Selecione o componente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portugues">Língua Portuguesa</SelectItem>
                        <SelectItem value="matematica">Matemática</SelectItem>
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
                        <SelectItem value="diagnostica-1">Diagnóstica 1</SelectItem>
                        <SelectItem value="diagnostica-2">Diagnóstica 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Arquivo do Gabarito (Excel)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="file-upload" 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      onChange={handleFileChange}
                    />
                    <Button 
                      onClick={handleImportar}
                      disabled={!file || !turma || !componente || !avaliacao}
                      className="whitespace-nowrap"
                    >
                      Importar Gabarito
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
                    <li>A primeira coluna deve conter o número da questão</li>
                    <li>A segunda coluna deve conter a alternativa correta (A, B, C, D ou E)</li>
                    <li>Caso a questão tenha descritor, inclua na terceira coluna</li>
                    <li>Utilize a planilha modelo disponível para <a href="#" className="text-blue-600 underline">download</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cadastrar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Gabarito Manualmente</CardTitle>
                <CardDescription>
                  Preencha o gabarito manualmente questão por questão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="turma-manual">Turma</Label>
                    <Select value={turma} onValueChange={setTurma}>
                      <SelectTrigger id="turma-manual">
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5-ano">5º Ano</SelectItem>
                        <SelectItem value="9-ano">9º Ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="componente-manual">Componente Curricular</Label>
                    <Select value={componente} onValueChange={setComponente}>
                      <SelectTrigger id="componente-manual">
                        <SelectValue placeholder="Selecione o componente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portugues">Língua Portuguesa</SelectItem>
                        <SelectItem value="matematica">Matemática</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avaliacao-manual">Avaliação</Label>
                    <Select value={avaliacao} onValueChange={setAvaliacao}>
                      <SelectTrigger id="avaliacao-manual">
                        <SelectValue placeholder="Selecione a avaliação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diagnostica-1">Diagnóstica 1</SelectItem>
                        <SelectItem value="diagnostica-2">Diagnóstica 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="num-questoes">Número de Questões</Label>
                    <Select value={numQuestoes} onValueChange={handleNumQuestoesChange}>
                      <SelectTrigger id="num-questoes">
                        <SelectValue placeholder="Quantidade" />
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
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-4">Preencha o gabarito:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {gabarito.map((alt, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="font-medium w-8">Q{index + 1}:</span>
                        <Select value={alt} onValueChange={(value) => handleAlternativaChange(index, value)}>
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
                
                <Button 
                  onClick={handleSalvarGabarito} 
                  className="w-full"
                  disabled={!turma || !componente || !avaliacao || gabarito.some(alt => alt === '')}
                >
                  Salvar Gabarito
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="consultar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gabaritos Cadastrados</CardTitle>
                <CardDescription>
                  Visualize e gerencie os gabaritos das avaliações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Avaliação</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-center">Questões</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_GABARITOS.map((gabarito) => (
                        <TableRow key={gabarito.id}>
                          <TableCell className="font-medium">{gabarito.avaliacao}</TableCell>
                          <TableCell>{new Date(gabarito.data).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="text-center">{gabarito.questoes}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">Visualizar</Button>
                              <Button variant="outline" size="sm">Editar</Button>
                              <Button variant="destructive" size="sm">Excluir</Button>
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

export default Gabaritos;
