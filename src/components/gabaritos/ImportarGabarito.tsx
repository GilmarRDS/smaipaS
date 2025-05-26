import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { avaliacoesService } from '@/services/avaliacoesService';
import { descritoresService } from '@/services/descritoresService';
import { Avaliacao } from '@/types/avaliacoes';
import { Descritor } from '@/types/gabaritos';

interface ImportarGabaritoProps {
  componente: string;
  setComponente: (value: string) => void;
  ano: string;
  setAno: (value: string) => void;
  avaliacao: string;
  setAvaliacao: (value: string) => void;
}

const anos = ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano'];

const ImportarGabarito: React.FC<ImportarGabaritoProps> = ({
  componente,
  setComponente,
  ano,
  setAno,
  avaliacao,
  setAvaliacao,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [descritores, setDescritores] = useState<Descritor[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
          selectedFile.type !== 'application/vnd.ms-excel') {
        toast.error('Formato de arquivo inválido', {
          description: 'Por favor, selecione um arquivo Excel (.xlsx ou .xls)'
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    if (!componente || !ano || !avaliacao) {
      toast.error('Preencha todos os campos obrigatórios', {
        description: 'Componente curricular, ano e avaliação são obrigatórios'
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('componente', componente);
      formData.append('ano', ano);
      formData.append('avaliacaoId', avaliacao);

      // TODO: Implementar upload do arquivo
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulação de upload
      
      toast.success('Gabarito importado com sucesso!');
      setFile(null);
    } catch (error) {
      console.error('Erro ao importar gabarito:', error);
      toast.error('Erro ao importar gabarito');
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
            <Label htmlFor="ano-import">Ano</Label>
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger id="ano-import">
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
            <Label htmlFor="avaliacao-import">Avaliação</Label>
            <Select value={avaliacao} onValueChange={setAvaliacao}>
              <SelectTrigger id="avaliacao-import">
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

        <div className="border-2 border-dashed rounded-lg p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center justify-center gap-2">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Arraste e solte seu arquivo aqui</p>
                <p className="text-xs text-muted-foreground">ou</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Label
                htmlFor="file-upload"
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
              >
                Selecionar arquivo
              </Label>
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm">
                <FileType className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {file && (
          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-800" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p>Arquivo selecionado: {file.name}</p>
                <p className="text-sm">O arquivo deve conter as seguintes colunas:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Número da questão</li>
                  <li>Resposta (A, B, C, D ou E)</li>
                  <li>Código do descritor</li>
                </ul>
                <p className="text-sm mt-2">Descritores disponíveis:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {descritores.map(d => (
                    <li key={d.id}>{d.codigo} - {d.descricao}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleUpload}
          className="w-full"
          disabled={!file || !componente || !ano || !avaliacao || isUploading}
        >
          {isUploading ? (
            <>Importando...</>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Importar Gabarito
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImportarGabarito;
