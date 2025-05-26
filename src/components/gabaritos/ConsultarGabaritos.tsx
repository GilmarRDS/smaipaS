import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileDown, Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { avaliacoesService } from '@/services/avaliacoesService';
import { gabaritosService } from '@/services/gabaritosService';
import { descritoresService } from '@/services/descritoresService';
import { Avaliacao } from '@/types/avaliacoes';
import { Descritor, Gabarito } from '@/types/gabaritos';

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
          Selecione os filtros para visualizar os gabaritos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="componente-consulta">Componente Curricular</Label>
            <Select value={componente} onValueChange={setComponente}>
              <SelectTrigger id="componente-consulta">
                <SelectValue placeholder="Selecione o componente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portugues">Língua Portuguesa</SelectItem>
                <SelectItem value="matematica">Matemática</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ano-consulta">Ano</Label>
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger id="ano-consulta">
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
            <Label htmlFor="avaliacao-consulta">Avaliação</Label>
            <Select value={avaliacao} onValueChange={setAvaliacao}>
              <SelectTrigger id="avaliacao-consulta">
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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : gabaritos.length > 0 ? (
          <div className="space-y-4">
            {gabaritos.map((gabarito) => (
              <Card key={gabarito.id} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Gabarito #{gabarito.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-500">
                        Criado em {new Date(gabarito.dataCriacao).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportar(gabarito.id)}
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleExcluir(gabarito.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gabarito.itens.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded-md border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Questão {item.numero}</span>
                          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                            {item.resposta}
                          </span>
                        </div>
                        {item.descritor && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.descritor.codigo} - {item.descritor.descricao}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : avaliacao ? (
          <Alert>
            <AlertDescription>
              Nenhum gabarito encontrado para esta avaliação.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ConsultarGabaritos;
