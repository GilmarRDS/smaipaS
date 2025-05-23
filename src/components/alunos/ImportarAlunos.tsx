import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UploadCloud, FileType, AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { turmasService } from '@/services/turmasService';
import { alunosService } from '@/services/alunosService';
import useAuth from '@/hooks/useAuth';
import { escolasService } from '@/services/escolasService';
import { Escola } from '@/types/escolas';

interface ImportarAlunosProps {
  onImportSuccess?: () => void;
}

const ImportarAlunos: React.FC<ImportarAlunosProps> = ({
  onImportSuccess
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [turmas, setTurmas] = useState<{id: string, nome: string}[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [selectedEscolaId, setSelectedEscolaId] = useState<string | undefined>(undefined);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');

  // Efeito para carregar escolas se o usuário for secretaria
  React.useEffect(() => {
    console.log('useEffect [user?.role] executado');
    const fetchEscolas = async () => {
      if (user?.role === 'secretaria') {
        try {
          const escolasData = await escolasService.listar();
          setEscolas(escolasData);
          // Se não houver escola selecionada e houver escolas disponíveis, seleciona a primeira
          if (!selectedEscolaId && escolasData.length > 0) {
            setSelectedEscolaId(escolasData[0].id);
          }
        } catch (error) {
          console.error('Erro ao buscar escolas:', error);
          toast.error('Erro ao carregar escolas');
        }
      }
    };
    fetchEscolas();
  }, [user?.role]);

  // Efeito para carregar turmas
  React.useEffect(() => {
    console.log('useEffect [user?.schoolId, user?.role, selectedEscolaId] executado');
    console.log('Estado atual - selectedEscolaId:', selectedEscolaId, 'user?.role:', user?.role, 'user?.schoolId:', user?.schoolId);

    const fetchTurmas = async () => {
      try {
        let idParaListarTurmas: string | undefined = undefined;

        // Se for usuário da escola, usa o schoolId do usuário
        if (user?.role === 'escola') {
          if (!user?.schoolId) {
             toast.error('Usuário sem escola associada');
             setTurmas([]);
             return;
          }
          idParaListarTurmas = user.schoolId;
          console.log('Listando turmas para escola do usuário:', idParaListarTurmas);
        }
        // Se for usuário da secretaria, usa o selectedEscolaId
        else if (user?.role === 'secretaria') {
           if (!selectedEscolaId) {
             console.log('Secretaria sem escola selecionada, limpando turmas.');
             setTurmas([]);
             setSelectedTurmaId('');
             return;
           }
           idParaListarTurmas = selectedEscolaId;
           console.log('Listando turmas para escola selecionada pela secretaria:', idParaListarTurmas);
        } else {
           console.log('Role desconhecido ou sem usuário, limpando turmas.');
           setTurmas([]);
           setSelectedTurmaId('');
           return;
        }

        // Busca as turmas usando o ID determinado (escola do usuário ou escola selecionada)
        const turmasData = await turmasService.listar(idParaListarTurmas);
        setTurmas(turmasData);
        console.log('Turmas carregadas:', turmasData.length);

        // Limpa a turma selecionada se a lista de turmas mudar
        setSelectedTurmaId('');
        console.log('Limpando turma selecionada.');

      } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        toast.error('Erro ao carregar turmas');
        setTurmas([]);
        setSelectedTurmaId('');
      }
    };
    fetchTurmas();
  }, [user?.schoolId, user?.role, selectedEscolaId]);

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

  const handleDownloadTemplate = async () => {
    try {
      const response = await alunosService.downloadTemplate();
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_alunos.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar template:', error);
      toast.error('Erro ao baixar template');
    }
  };

  const handleImportar = async () => {
    if (!file) {
      toast.error('Selecione um arquivo para importar');
      return;
    }

    if (!selectedTurmaId) {
      toast.error('Selecione uma turma', {
        description: 'A turma é obrigatória para importação'
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('turmaId', selectedTurmaId);

      await alunosService.importarAlunos(formData);

      toast.success('Alunos importados com sucesso!');
      setFile(null);
      setSelectedTurmaId('');
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Erro ao importar alunos:', error);
      toast.error('Erro ao importar alunos');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Alunos via Excel</CardTitle>
        <CardDescription>
          Faça upload de uma planilha Excel contendo os dados dos alunos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo de seleção de Escola para Secretaria */}
            {user?.role === 'secretaria' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="escola-select">Escola</Label>
                 <Select 
                   value={selectedEscolaId || ''} 
                   onValueChange={(value) => {
                     console.log('Escola selecionada:', value);
                     setSelectedEscolaId(value);
                     setSelectedTurmaId('');
                     console.log('Limpando turma ao mudar escola.');
                   }}
                 >
                   <SelectTrigger id="escola-select">
                     <SelectValue placeholder="Selecione a escola" />
                   </SelectTrigger>
                   <SelectContent>
                     {escolas.map(escola => (
                       <SelectItem key={escola.id} value={escola.id}>{escola.nome}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
            )}

            {/* Campo de seleção de Turma */}
            <div className="space-y-2">
              <Label htmlFor="turma-import">Turma</Label>
              <Select 
                value={selectedTurmaId} 
                onValueChange={(value) => {
                  console.log('Turma selecionada:', value);
                  setSelectedTurmaId(value);
                }} 
                disabled={user?.role === 'secretaria' && !selectedEscolaId}
              >
                <SelectTrigger id="turma-import">
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão Baixar Template */}
            <div className="space-y-2">
              <Label>Template</Label>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Template
              </Button>
            </div>
          </div>

          {/* Campo de upload de arquivo e botão importar */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo dos Alunos (Excel)</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  disabled={user?.role === 'secretaria' && !selectedEscolaId}
                />
              </div>
              <Button
                type="button"
                onClick={handleImportar}
                disabled={!file || !selectedTurmaId || isUploading || (user?.role === 'secretaria' && !selectedEscolaId)}
                className="whitespace-nowrap"
              >
                {isUploading ? (
                  <>Importando...</>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Importar Alunos
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
                <li>Baixe o template acima para ver o formato correto dos dados</li>
                <li>Preencha a planilha com os dados dos alunos</li>
                <li>Selecione a turma correta</li>
                <li>Faça upload do arquivo preenchido</li>
                <li>Os campos marcados com * são obrigatórios</li>
              </ul>
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
};

export default ImportarAlunos; 