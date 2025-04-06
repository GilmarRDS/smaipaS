
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Formato de arquivo inválido', {
          description: 'Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)'
        });
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
      toast.success('Arquivo selecionado com sucesso', {
        description: `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`
      });
    }
  };
  
  const handleImportar = () => {
    if (!file) {
      toast.error('Selecione um arquivo para importar');
      return;
    }
    
    if (!turma || !componente || !avaliacao) {
      toast.error('Preencha todos os campos obrigatórios', {
        description: 'Turma, componente curricular e avaliação são obrigatórios'
      });
      return;
    }
    
    // Simulação de importação
    setIsUploading(true);
    
    const promise = () => new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Gabarito importado com sucesso!'
        });
      }, 2000);
    });
    
    toast.promise(promise, {
      loading: 'Importando gabarito...',
      success: (data) => {
        setIsUploading(false);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        return 'Gabarito importado com sucesso!';
      },
      error: 'Erro ao importar gabarito',
    });
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
            <div className="relative flex-1">
              <Input 
                id="file-upload" 
                type="file" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            <Button 
              onClick={handleImportar}
              disabled={!file || !turma || !componente || !avaliacao || isUploading}
              className="whitespace-nowrap"
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
          </div>
          {file && (
            <p className="text-sm text-muted-foreground flex items-center">
              <FileType className="h-4 w-4 mr-1" />
              Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
        
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-800" />
          <AlertDescription className="text-blue-800">
            <h3 className="text-sm font-medium mb-2">Instruções para importação:</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>O arquivo deve estar no formato Excel (.xlsx, .xls) ou CSV (.csv)</li>
              <li>A primeira coluna deve conter o número da questão</li>
              <li>A segunda coluna deve conter a alternativa correta (A, B, C, D ou E)</li>
              <li>Caso a questão tenha descritor, inclua na terceira coluna</li>
              <li>Utilize a planilha modelo disponível para <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">download</Button></li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ImportarGabarito;
