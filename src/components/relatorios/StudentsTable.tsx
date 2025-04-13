
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ActionButton } from '@/components/ui/action-button';
import { Button } from '@/components/ui/button';
import { FileText, FileDown, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Student {
  id: string;
  nome: string;
  presente: boolean;
  portugues: number | null;
  matematica: number | null;
  media: number | null;
  transferida?: boolean;
  descritores: {
    portugues: Array<{
      codigo: string;
      nome: string;
      percentual: number;
    }> | null;
    matematica: Array<{
      codigo: string;
      nome: string;
      percentual: number;
    }> | null;
  } | null;
}

interface StudentsTableProps {
  students: Student[];
  isTurmaSelected: boolean;
  selectedTurma: { id: string; nome: string } | undefined;
  onViewStudentDetails: (student: Student) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({ 
  students, 
  isTurmaSelected, 
  selectedTurma,
  onViewStudentDetails
}) => {
  const handleExportReport = (format: 'excel' | 'pdf') => {
    if (!isTurmaSelected) {
      toast.error("Selecione uma turma específica para exportar o relatório");
      return;
    }
    
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    const fileName = `relatorio_turma_${selectedTurma?.nome?.toLowerCase().replace(/\s+/g, '_') || 'selecionada'}.${extension}`;
    
    let content = '';
    
    if (format === 'excel') {
      content = 'Relatório da Turma: ' + (selectedTurma?.nome || 'Selecionada') + '\r\n\r\n';
      content += 'Aluno\tPortuguês\tMatemática\tMédia\r\n';
      
      students.forEach(student => {
        if (student.presente) {
          content += `${student.nome}\t${student.portugues}%\t${student.matematica}%\t${student.media}%\r\n`;
        } else {
          content += `${student.nome}\tAusente\tAusente\tAusente\r\n`;
        }
      });
    } else {
      content = 'Relatório de Desempenho - Turma: ' + (selectedTurma?.nome || 'Selecionada') + '\r\n\r\n';
      content += 'Listagem de Alunos:\r\n\r\n';
      
      students.forEach(student => {
        if (student.presente) {
          content += `${student.nome}: Português ${student.portugues}%, Matemática ${student.matematica}%, Média ${student.media}%\r\n`;
        } else {
          content += `${student.nome}: Ausente\r\n`;
        }
      });
    }
    
    const mimeType = format === 'excel' 
      ? 'text/csv;charset=utf-8'
      : 'application/pdf';
    
    const blob = new Blob([content], { type: mimeType });
    
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Relatório da turma ${selectedTurma?.nome || ''} baixado como ${format.toUpperCase()}`, {
      description: `Arquivo ${fileName} salvo na pasta de downloads`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho Individual dos Alunos</CardTitle>
        <CardDescription>
          Para visualizar os dados individuais, selecione uma turma específica
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isTurmaSelected ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-muted-foreground">Selecione uma turma específica para visualizar o desempenho individual dos alunos</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Aluno</th>
                    <th className="p-2 text-center">Situação</th>
                    <th className="p-2 text-center">Português</th>
                    <th className="p-2 text-center">Matemática</th>
                    <th className="p-2 text-center">Média Geral</th>
                    <th className="p-2 text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-2 font-medium">{student.nome}</td>
                      <td className="p-2 text-center">
                        {student.transferida ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Transferida</span>
                        ) : student.presente ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Presente</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Ausente</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {student.portugues ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.portugues >= 70 ? 'bg-green-100 text-green-800' : 
                            student.portugues >= 60 ? 'bg-blue-100 text-blue-800' : 
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {student.portugues}%
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {student.matematica ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.matematica >= 70 ? 'bg-green-100 text-green-800' : 
                            student.matematica >= 60 ? 'bg-blue-100 text-blue-800' : 
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {student.matematica}%
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {student.media ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.media >= 70 ? 'bg-green-100 text-green-800' : 
                            student.media >= 60 ? 'bg-blue-100 text-blue-800' : 
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {student.media}%
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">-</span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        <ActionButton 
                          action="view" 
                          onClick={() => onViewStudentDetails(student)}
                          disabled={!student.presente}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <FileText className="h-5 w-5 mr-2" />
                    Exportar Relatório da Turma
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportReport('excel')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    <span>Baixar como Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportReport('pdf')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    <span>Baixar como PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
