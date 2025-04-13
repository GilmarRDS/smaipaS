
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, FileDown, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ExportReportButtonProps {
  isTurmaSelected: boolean;
  selectedTurma?: { id: string; nome: string };
  students: Array<{
    id: string;
    nome: string;
    presente: boolean;
    portugues: number | null;
    matematica: number | null;
    media: number | null;
  }>;
}

const ExportReportButton: React.FC<ExportReportButtonProps> = ({ 
  isTurmaSelected, 
  selectedTurma, 
  students 
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
  );
};

export default ExportReportButton;
