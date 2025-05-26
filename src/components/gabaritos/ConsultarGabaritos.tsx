import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, Download, Trash2 } from 'lucide-react';
import { avaliacoesService } from '@/services/avaliacoesService';
import { gabaritosService } from '@/services/gabaritosService';
import { descritoresService } from '@/services/descritoresService';
import { Avaliacao } from '@/types/avaliacoes';
import { Gabarito, Descritor } from '@/types/gabaritos';

interface ConsultarGabaritosProps {
  componente: string;
  setComponente: (value: string) => void;
  ano: string;
  setAno: (value: string) => void;
  avaliacao: string;
  setAvaliacao: (value: string) => void;
}

const anos = ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano'];

const ConsultarGabaritos: React.FC<ConsultarGabaritosProps> = ({
  componente,
  setComponente,
  ano,
  setAno,
  avaliacao,
  setAvaliacao,
}) => {
  const [gabaritos, setGabaritos] = useState<Gabarito[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [descritores, setDescritores] = useState<Descritor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar avaliações quando o ano for selecionado
  useEffect(() => {
    const carregarAvaliacoes = async () => {
      if (!ano) {
        setAvaliacoes([]);
        return;
      }
      try {
        const avaliacoesData = await avaliacoesService.listarPorAno(ano);
        setAvaliacoes(avaliacoesData);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        toast.error('Erro ao carregar avaliações');
      }
    };
    carregarAvaliacoes();
  }, [ano]);

  // Carregar descritores quando o componente for selecionado
  useEffect(() => {
    const carregarDescritores = async () => {
      if (!componente) {
        setDescritores([]);
        return;
      }
      try {
        const descritoresData = await descritoresService.listarPorComponente(componente);
        setDescritores(descritoresData);
      } catch (error) {
        console.error('Erro ao carregar descritores:', error);
        toast.error('Erro ao carregar descritores');
      }
    };
    carregarDescritores();
  }, [componente]);

  // Carregar gabaritos quando a avaliação for selecionada
  useEffect(() => {
    const carregarGabaritos = async () => {
      if (!avaliacao) {
        setGabaritos([]);
        return;
      }
      setIsLoading(true);
      try {
        const gabaritosData = await gabaritosService.listarPorAvaliacao(avaliacao);
        setGabaritos(gabaritosData);
      } catch (error) {
        console.error('Erro ao carregar gabaritos:', error);
        toast.error('Erro ao carregar gabaritos');
      } finally {
        setIsLoading(false);
      }
    };
    carregarGabaritos();
  }, [avaliacao]);

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este gabarito?')) {
      return;
    }

    try {
      await gabaritosService.excluir(id);
      toast.success('Gabarito excluído com sucesso!');
      // Recarregar gabaritos
      const gabaritosData = await gabaritosService.listarPorAvaliacao(avaliacao);
      setGabaritos(gabaritosData);
    } catch (error) {
      console.error('Erro ao excluir gabarito:', error);
      toast.error('Erro ao excluir gabarito');
    }
  };

  const handleExportar = async (id: string) => {
    try {
      await gabaritosService.exportar(id);
      toast.success('Gabarito exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar gabarito:', error);
      toast.error('Erro ao exportar gabarito');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultar Gabaritos</CardTitle>
        <CardDescription>
          Visualize, exporte e exclua gabaritos cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="componente-consult">Componente Curricular</Label>
            <Select value={componente} onValueChange={setComponente}>
              <SelectTrigger id="componente-consult">
                <SelectValue placeholder="Selecione o componente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portugues">Língua Portuguesa</SelectItem>
                <SelectItem value="matematica">Matemática</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ano-consult">Ano</Label>
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger id="ano-consult">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {anos.map(ano => (
                  <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avaliacao-consult">Avaliação</Label>
            <Select value={avaliacao} onValueChange={setAvaliacao}>
              <SelectTrigger id="avaliacao-consult">
                <SelectValue placeholder="Selecione a avaliação" />
              </SelectTrigger>
              <SelectContent>
                {avaliacoes.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Carregando gabaritos...</div>
        ) : gabaritos.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum gabarito encontrado para esta avaliação
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Questão</TableHead>
                  <TableHead>Resposta</TableHead>
                  <TableHead>Descritor</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gabaritos.map(gabarito => (
                  <TableRow key={gabarito.id}>
                    <TableCell>{gabarito.itens.map(item => item.numero).join(', ')}</TableCell>
                    <TableCell>{gabarito.itens.map(item => item.resposta).join(', ')}</TableCell>
                    <TableCell>
                      {gabarito.itens.map(item => {
                        const descritor = descritores.find(d => d.id === item.descritorId);
                        return descritor ? `${descritor.codigo} - ${descritor.descricao}` : 'Descritor não encontrado';
                      }).join(', ')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExportar(gabarito.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExcluir(gabarito.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
  );
};

export default ConsultarGabaritos;
