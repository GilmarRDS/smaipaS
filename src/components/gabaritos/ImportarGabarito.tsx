import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { avaliacoesService } from '@/services/avaliacoesService';
import { gabaritosService } from '@/services/gabaritosService';
import { Avaliacao } from '@/types/avaliacoes';
import * as XLSX from 'xlsx';
import DownloadTemplateGabarito from './DownloadTemplateGabarito';
import { useToast } from '@/components/ui/use-toast';
import { descritoresService } from '@/services/descritoresService';
import { Descritor } from '@/types/gabaritos';

interface ImportarGabaritoProps {
  componente: string;
  setComponente: (value: string) => void;
  ano: string;
  setAno: (value: string) => void;
  avaliacao: string;
  setAvaliacao: (value: string) => void;
  numQuestoes: string;
  setNumQuestoes: (value: string) => void;
  gabarito: { resposta: string, codigoDescritor: string }[];
  setGabarito: (value: { resposta: string, codigoDescritor: string }[]) => void;
}

interface RespostaRow {
  Questão: string;
  Resposta: string;
  'Descritor Código': string;
}

const anos = ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano'];

const ImportarGabarito: React.FC<ImportarGabaritoProps> = ({
  componente,
  setComponente,
  ano,
  setAno,
  avaliacao,
  setAvaliacao,
  numQuestoes,
  setNumQuestoes,
  gabarito,
  setGabarito,
}) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [descritores, setDescritores] = useState<Descritor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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
  }, [componente, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<RespostaRow>(worksheet);

          // Validar dados
          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            throw new Error('O arquivo não contém dados válidos');
          }

          // Extrair respostas e códigos dos descritores
          const gabaritoImportado = jsonData.map((row) => {
            const resposta = row.Resposta?.toString().toUpperCase();
            const codigoDescritor = row['Descritor Código']?.toString().trim();

            if (!resposta || !['A', 'B', 'C', 'D', 'E'].includes(resposta)) {
              throw new Error(`Resposta inválida na questão ${row.Questão}`);
            }
            if (!codigoDescritor) {
               throw new Error(`Código do descritor ausente na questão ${row.Questão}`);
            }
            // Opcional: Validar se o código do descritor existe na lista carregada
            // const descritorExistente = descritores.find(d => d.codigo === codigoDescritor);
            // if (!descritorExistente) {
            //   throw new Error(`Código do descritor ${codigoDescritor} na questão ${row.Questão} não encontrado.`);
            // }

            return { resposta, codigoDescritor }; // Armazenar resposta e código
          });

          setGabarito(gabaritoImportado);
          setNumQuestoes(gabaritoImportado.length.toString());
          toast({ title: 'Gabarito importado com sucesso!', description: `Foram importadas ${gabaritoImportado.length} questões.` });
        } catch (error) {
          toast({ title: 'Erro na importação', description: error instanceof Error ? error.message : 'Erro ao processar o arquivo' });
        }
      };

      reader.onerror = () => {
        toast({ title: 'Erro ao ler o arquivo', description: 'Não foi possível ler o arquivo. Tente novamente mais tarde.' });
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      toast({ title: 'Erro ao processar o arquivo', description: 'Não foi possível processar o arquivo. Tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  const handleSalvarGabaritoImportado = async () => {
    if (!avaliacao) {
      toast({ title: 'Selecione uma avaliação' });
      return;
    }

    if (gabarito.length === 0) {
      toast({ title: 'Importe um gabarito primeiro' });
      return;
    }
     // Validar se todos os descritores importados existem antes de salvar
    const descritoresInvalidos = gabarito.filter(item => 
      !descritores.find(d => d.codigo === item.codigoDescritor)
    );
    if (descritoresInvalidos.length > 0) {
      toast({ 
        title: 'Códigos de descritores inválidos', 
        description: `Os códigos dos descritores para as questões ${descritoresInvalidos.map(item => item.codigoDescritor).join(', ')} não foram encontrados.` 
      });
      return;
    }

    setIsLoading(true);
    try {
      await gabaritosService.criar({
        avaliacaoId: avaliacao,
        itens: gabarito.map((item, index) => {
          // Encontrar o descritor correspondente pelo código importado
          const descritor = descritores.find(d => d.codigo === item.codigoDescritor);
          return {
            numero: index + 1,
            resposta: item.resposta,
            descritorId: descritor?.id || '' // Usar o ID encontrado ou string vazia (embora a validação acima evite isso)
          }
        }),
      });
      toast({ title: 'Gabarito importado salvo com sucesso!' });
      setGabarito([]);
      setNumQuestoes('');
    } catch (error) {
      console.error('Erro ao salvar gabarito importado:', error);
      toast({ title: 'Erro ao salvar gabarito importado', description: 'Não foi possível salvar o gabarito importado. Tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Gabarito</CardTitle>
        <CardDescription>
          Importe o gabarito através de uma planilha Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="componente-importacao">Componente Curricular</Label>
            <Select value={componente} onValueChange={setComponente}>
              <SelectTrigger id="componente-importacao">
                <SelectValue placeholder="Selecione o componente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portugues">Língua Portuguesa</SelectItem>
                <SelectItem value="matematica">Matemática</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ano-importacao">Ano</Label>
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger id="ano-importacao">
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
            <Label htmlFor="avaliacao-importacao">Avaliação</Label>
            <Select value={avaliacao} onValueChange={setAvaliacao}>
              <SelectTrigger id="avaliacao-importacao">
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
          <div className="space-y-2">
            <Label htmlFor="numQuestoes">Número de Questões</Label>
            <Input
              id="numQuestoes"
              type="number"
              value={numQuestoes}
              onChange={(e) => setNumQuestoes(e.target.value)}
              placeholder="Digite o número de questões"
            />
          </div>

          <DownloadTemplateGabarito numQuestoes={numQuestoes} descritores={descritores} />

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo Excel</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <Button
                onClick={handleImport}
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {gabarito.length > 0 && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Gabarito importado com {gabarito.length} questões
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSalvarGabaritoImportado}
          className="w-full"
          disabled={gabarito.length === 0 || !avaliacao || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvar Gabarito Importado
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Gabarito Importado
            </>
          )}
        </Button>

      </CardContent>
    </Card>
  );
};

export default ImportarGabarito;
