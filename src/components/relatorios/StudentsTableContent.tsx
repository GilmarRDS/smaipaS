
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
            <StudentTableRow 
              key={student.id} 
              student={student} 
              onViewStudentDetails={onViewStudentDetails} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTableContent;
