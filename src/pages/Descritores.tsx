import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PenSquare, Trash2 } from 'lucide-react';

const MOCK_DESCRITORES = [
  { id: 'd1', codigo: 'D01', componente: 'Língua Portuguesa', descritor: 'Localizar informações explícitas em um texto', habilidade: 'Localizar informações explícitas em diferentes gêneros textuais' },
  { id: 'd2', codigo: 'D02', componente: 'Língua Portuguesa', descritor: 'Inferir o sentido de uma palavra ou expressão', habilidade: 'Identificar o sentido de palavras ou expressões a partir do contexto em que são utilizadas' },
  { id: 'd3', codigo: 'D03', componente: 'Língua Portuguesa', descritor: 'Inferir uma informação implícita em um texto', habilidade: 'Inferir uma informação implícita em textos de diferentes gêneros e temáticas' },
  { id: 'd4', codigo: 'D04', componente: 'Matemática', descritor: 'Identificar propriedades de figuras geométricas', habilidade: 'Reconhecer e classificar figuras planas e espaciais' },
  { id: 'd5', codigo: 'D05', componente: 'Matemática', descritor: 'Resolver problemas envolvendo as quatro operações', habilidade: 'Resolver situações-problema envolvendo adição, subtração, multiplicação e divisão' },
  { id: 'd6', codigo: 'D06', componente: 'Matemática', descritor: 'Resolver problemas envolvendo frações', habilidade: 'Resolver situações-problema envolvendo números racionais na forma fracionária' },
];

const Descritores: React.FC = () => {
  const { isSecretaria } = useAuth();
  const [descritores, setDescritores] = useState(MOCK_DESCRITORES);
  const [filtroComponente, setFiltroComponente] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descritor, setDescritor] = useState('');
  const [habilidade, setHabilidade] = useState('');
  const [componente, setComponente] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDescritor, setEditingDescritor] = useState<any>(null);
  
  const handleAddDescritor = () => {
    if (!codigo || !descritor || !habilidade || !componente) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (editingDescritor) {
      const updatedDescritores = descritores.map(d => 
        d.id === editingDescritor.id ? 
        { ...d, codigo, componente, descritor, habilidade } : 
        d
      );
      setDescritores(updatedDescritores);
      toast.success('Descritor atualizado com sucesso!');
    } else {
      const newDescritor = {
        id: `d${Date.now()}`,
        codigo,
        componente,
        descritor,
        habilidade
      };
      setDescritores([...descritores, newDescritor]);
      toast.success('Descritor cadastrado com sucesso!');
    }
    
    setDialogOpen(false);
    resetForm();
  };
  
  const handleEditDescritor = (descritor: any) => {
    setEditingDescritor(descritor);
    setCodigo(descritor.codigo);
    setDescritor(descritor.descritor);
    setHabilidade(descritor.habilidade);
    setComponente(descritor.componente.toLowerCase());
    setDialogOpen(true);
  };
  
  const handleDeleteDescritor = (id: string) => {
    toast("Confirmar exclusão", {
      description: "Tem certeza que deseja excluir este descritor?",
      action: {
        label: "Excluir",
        onClick: () => {
          setDescritores(descritores.filter(d => d.id !== id));
          toast.success('Descritor excluído com sucesso!');
        }
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}
      }
    });
  };
  
  const resetForm = () => {
    setCodigo('');
    setDescritor('');
    setHabilidade('');
    setComponente('');
    setEditingDescritor(null);
  };
  
  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };
  
  const filteredDescritores = descritores.filter(d => {
    const matchesComponente = filtroComponente === 'todos' || d.componente.toLowerCase().includes(filtroComponente.toLowerCase());
    const matchesSearch = 
      d.codigo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.descritor.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.habilidade.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesComponente && (searchQuery === '' || matchesSearch);
  });
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Descritores</h1>
            <p className="text-muted-foreground">
              Gerencie os descritores das avaliações
            </p>
          </div>
          
          {isSecretaria && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenDialog}>Adicionar Descritor</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingDescritor ? 'Editar Descritor' : 'Adicionar Novo Descritor'}</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do descritor e clique em salvar.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código</Label>
                      <Input 
                        id="codigo" 
                        placeholder="Ex: D15" 
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="componente-dialog">Componente Curricular</Label>
                      <Select value={componente} onValueChange={setComponente}>
                        <SelectTrigger id="componente-dialog">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="língua portuguesa">Língua Portuguesa</SelectItem>
                          <SelectItem value="matemática">Matemática</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descritor">Descritor</Label>
                    <Input 
                      id="descritor" 
                      placeholder="Descrição curta do descritor" 
                      value={descritor}
                      onChange={(e) => setDescritor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="habilidade">Habilidade</Label>
                    <Textarea 
                      id="habilidade" 
                      placeholder="Descrição detalhada da habilidade avaliada" 
                      value={habilidade}
                      onChange={(e) => setHabilidade(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddDescritor}>{editingDescritor ? 'Salvar Alterações' : 'Salvar'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Descritores</CardTitle>
            <CardDescription>
              Consulte e gerencie os descritores utilizados nas avaliações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por código, descritor ou habilidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={filtroComponente} onValueChange={setFiltroComponente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por componente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os componentes</SelectItem>
                    <SelectItem value="língua portuguesa">Língua Portuguesa</SelectItem>
                    <SelectItem value="matemática">Matemática</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Código</TableHead>
                    <TableHead className="w-[150px]">Componente</TableHead>
                    <TableHead>Descritor</TableHead>
                    <TableHead>Habilidade</TableHead>
                    {isSecretaria && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDescritores.length > 0 ? (
                    filteredDescritores.map((descritor) => (
                      <TableRow key={descritor.id}>
                        <TableCell className="font-medium">{descritor.codigo}</TableCell>
                        <TableCell>{descritor.componente}</TableCell>
                        <TableCell>{descritor.descritor}</TableCell>
                        <TableCell className="text-sm">{descritor.habilidade}</TableCell>
                        {isSecretaria && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditDescritor(descritor)}
                              >
                                <PenSquare className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={() => handleDeleteDescritor(descritor.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isSecretaria ? 5 : 4} className="text-center py-4">
                        Nenhum descritor encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Descritores;
