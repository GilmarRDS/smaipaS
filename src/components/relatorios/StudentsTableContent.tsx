import React from 'react';
import StudentTableRow from './StudentTableRow';

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

interface StudentsTableContentProps {
  students: Student[];
  onViewStudentDetails: (student: Student) => void;
}

const StudentsTableContent: React.FC<StudentsTableContentProps> = ({ students, onViewStudentDetails }) => {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome do Aluno</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Português</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Matemática</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Média</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <StudentTableRow
              key={student.id}
              student={student}
              onViewDetails={() => onViewStudentDetails(student)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTableContent;
