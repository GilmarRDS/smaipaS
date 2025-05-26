import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, CheckCircle, Loader2, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { avaliacoesService } from '@/services/avaliacoesService';
import { gabaritosService } from '@/services/gabaritosService';
import { descritoresService } from '@/services/descritoresService';
import { Avaliacao } from '@/types/avaliacoes';
import { Descritor } from '@/types/gabaritos';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import DownloadTemplateGabarito from './DownloadTemplateGabarito';
import { useToast } from '@/components/ui/use-toast';

interface CadastrarGabaritoProps {
  componente: string;
  setComponente: (value: string) => void;
  ano: string;
  setAno: (value: string) => void;
  avaliacao: string;
  setAvaliacao: (value: string) => void;
}

interface RespostaRow {
  Questão: string;
  Resposta: string;
}

const anos = ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano'];
const alternativas = ['A', 'B', 'C', 'D', 'E'];

interface QuestaoGabarito {
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
  const [questoes, setQuestoes] = useState<QuestaoGabarito[]>(Array(10).fill({ resposta: '', descritorId: '' }));
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar avaliações quando o ano E componente forem selecionados
  useEffect(() => {
    const carregarAvaliacoes = async () => {
      if (!ano || !componente) {
        setAvaliacoes([]);
        return;
      }
      try {
        const avaliacoesData = await avaliacoesService.listarPorAnoEComponente(ano, componente);
        setAvaliacoes(avaliacoesData);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        toast({ title: 'Erro ao carregar avaliações', description: 'Não foi possível carregar as avaliações. Tente novamente.' });
      }
    };
    carregarAvaliacoes();
  }, [ano, componente, toast]);

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
        toast({ title: 'Erro ao carregar descritores', description: 'Não foi possível carregar os descritores. Tente novamente.' });
      }
    };
    carregarDescritores();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componente, toast]);

  const handleAlternativaChange = (index: number, value: string) => {
    const newQuestoes = [...questoes];
    newQuestoes[index] = { ...newQuestoes[index], resposta: value };
    setQuestoes(newQuestoes);
  };

  const handleDescritorChange = (index: number, value: string) => {
    const newQuestoes = [...questoes];
    newQuestoes[index] = { ...newQuestoes[index], descritorId: value };
    setQuestoes(newQuestoes);
  };

  const handleSalvarGabarito = async () => {
    if (!avaliacao) {
      toast({ title: 'Selecione uma avaliação' });
      return;
    }

    if (questoes.some(q => !q.resposta || !q.descritorId)) {
      toast({ title: 'Preencha todas as questões do gabarito', description: 'Por favor, preencha todas as questões do gabarito antes de salvar.' });
      return;
    }

    setIsLoading(true);
    try {
      await gabaritosService.criar({
        avaliacaoId: avaliacao,
        itens: questoes.map((questao, index) => ({
          numero: index + 1,
          resposta: questao.resposta,
          descritorId: questao.descritorId,
        })),
      });
      toast({ title: 'Gabarito salvo com sucesso!' });
      setQuestoes(Array(10).fill({ resposta: '', descritorId: '' }));
    } catch (error) {
      console.error('Erro ao salvar gabarito:', error);
      toast({ title: 'Erro ao salvar gabarito', description: 'Não foi possível salvar o gabarito. Tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionPercentage = (): number => {
    const filled = questoes.filter(q => q.resposta && q.descritorId).length;
    return Math.round((filled / questoes.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Gabarito Manualmente</CardTitle>
          <CardDescription>
            Preencha o gabarito manualmente questão por questão
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

          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Preencha o gabarito:</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {completionPercentage}% preenchido
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      completionPercentage === 100 
                        ? 'bg-green-500' 
                        : completionPercentage > 50 
                          ? 'bg-blue-500' 
                          : 'bg-amber-500'
                    }`} 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {questoes.map((questao, index) => (
                <div key={index} className="flex flex-col gap-2 p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Questão {index + 1}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`resposta-${index}`} className="text-sm">Resposta:</Label>
                        <Select 
                          value={questao.resposta} 
                          onValueChange={(value) => handleAlternativaChange(index, value)}
                        >
                          <SelectTrigger id={`resposta-${index}`} className="w-20">
                            <SelectValue placeholder="?" />
                          </SelectTrigger>
                          <SelectContent>
                            {alternativas.map(letra => (
                              <SelectItem key={letra} value={letra}>{letra}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`descritor-${index}`} className="text-sm">Descritor:</Label>
                        <Select
                          value={questao.descritorId}
                          onValueChange={(value) => handleDescritorChange(index, value)}
                        >
                          <SelectTrigger id={`descritor-${index}`} className="w-64">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {completionPercentage === 100 && (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-800" />
              <AlertDescription className="text-green-800">
                Todas as questões preenchidas! Você pode salvar o gabarito.
              </AlertDescription>
            </Alert>
          )}
          
          <Button
            onClick={handleSalvarGabarito}
            className="w-full"
            disabled={!avaliacao || questoes.some(q => !q.resposta || !q.descritorId) || isLoading}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastrarGabarito;
