import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { avaliacoesService } from '@/services/avaliacoesService';
import { gabaritosService } from '@/services/gabaritosService';
import { descritoresService } from '@/services/descritoresService';
import { Avaliacao } from '@/types/avaliacoes';
import { Descritor } from '@/types/gabaritos';

interface CadastrarGabaritoProps {
  componente: string;
  setComponente: (value: string) => void;
  ano: string;
  setAno: (value: string) => void;
  avaliacao: string;
  setAvaliacao: (value: string) => void;
}

const anos = ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano'];

interface ItemGabarito {
  numero: number;
  resposta: string;
  descritorId: string;
}

const CadastrarGabarito: React.FC<CadastrarGabaritoProps> = ({
  componente,
  setComponente,
  ano,
  setAno,
  avaliacao,
  setAvaliacao,
}) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [descritores, setDescritores] = useState<Descritor[]>([]);
  const [itens, setItens] = useState<ItemGabarito[]>([]);
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

  const handleAdicionarItem = () => {
    setItens([...itens, { numero: itens.length + 1, resposta: '', descritorId: '' }]);
  };

  const handleRemoverItem = (index: number) => {
    const novosItens = itens.filter((_, i) => i !== index);
    // Reordenar os números das questões
    setItens(novosItens.map((item, i) => ({ ...item, numero: i + 1 })));
  };

  const handleItemChange = (index: number, field: keyof ItemGabarito, value: string) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [field]: value };
    setItens(novosItens);
  };

  const handleSalvarGabarito = async () => {
    if (!avaliacao) {
      toast.error('Selecione uma avaliação');
      return;
    }

    if (itens.length === 0) {
      toast.error('Adicione pelo menos um item ao gabarito');
      return;
    }

    const itensIncompletos = itens.some(item => !item.resposta || !item.descritorId);
    if (itensIncompletos) {
      toast.error('Preencha todos os campos dos itens');
      return;
    }

    setIsLoading(true);
    try {
      await gabaritosService.criar({
        avaliacaoId: avaliacao,
        itens: itens.map(item => ({
          numero: item.numero,
          resposta: item.resposta,
          descritorId: item.descritorId,
        })),
      });
      toast.success('Gabarito salvo com sucesso!');
      setItens([]);
    } catch (error) {
      console.error('Erro ao salvar gabarito:', error);
      toast.error('Erro ao salvar gabarito');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Gabarito</CardTitle>
        <CardDescription>
          Preencha os campos para cadastrar um novo gabarito
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="componente-cadastro">Componente Curricular</Label>
            <Select value={componente} onValueChange={setComponente}>
              <SelectTrigger id="componente-cadastro">
                <SelectValue placeholder="Selecione o componente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portugues">Língua Portuguesa</SelectItem>
                <SelectItem value="matematica">Matemática</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ano-cadastro">Ano</Label>
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger id="ano-cadastro">
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
            <Label htmlFor="avaliacao-cadastro">Avaliação</Label>
            <Select value={avaliacao} onValueChange={setAvaliacao}>
              <SelectTrigger id="avaliacao-cadastro">
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Itens do Gabarito</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdicionarItem}
              disabled={!avaliacao}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>

          {itens.length === 0 ? (
            <Alert>
              <AlertDescription>
                Adicione itens ao gabarito usando o botão acima
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {itens.map((item, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Questão {item.numero}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`resposta-${index}`}>Resposta</Label>
                        <Input
                          id={`resposta-${index}`}
                          value={item.resposta}
                          onChange={(e) => handleItemChange(index, 'resposta', e.target.value)}
                          placeholder="Digite a resposta"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`descritor-${index}`}>Descritor</Label>
                        <Select
                          value={item.descritorId}
                          onValueChange={(value) => handleItemChange(index, 'descritorId', value)}
                        >
                          <SelectTrigger id={`descritor-${index}`}>
                            <SelectValue placeholder="Selecione o descritor" />
                          </SelectTrigger>
                          <SelectContent>
                            {descritores.map(d => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.codigo} - {d.descricao}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSalvarGabarito}
            disabled={isLoading || itens.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Gabarito
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CadastrarGabarito;
