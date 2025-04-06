
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ImportarGabaritoProps {
  turma: string;
  setTurma: (value: string) => void;
  componente: string;
  setComponente: (value: string) => void;
  avaliacao: string;
  setAvaliacao: (value: string) => void;
}

const ImportarGabarito: React.FC<ImportarGabaritoProps> = ({
  turma,
  setTurma,
  componente,
  setComponente,
  avaliacao,
  setAvaliacao,
}) => {
  const [file, setFile] = useState<File | null>(null);

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
  );
};

export default ImportarGabarito;
