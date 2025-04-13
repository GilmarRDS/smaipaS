
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import EmptyTableState from './EmptyTableState';
import StudentsTableContent from './StudentsTableContent';
import ExportReportButton from './ExportReportButton';

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
          <EmptyTableState />
        ) : (
          <div className="space-y-4">
            <StudentsTableContent 
              students={students} 
              onViewStudentDetails={onViewStudentDetails} 
            />
            
            <ExportReportButton 
              isTurmaSelected={isTurmaSelected}
              selectedTurma={selectedTurma}
              students={students}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
