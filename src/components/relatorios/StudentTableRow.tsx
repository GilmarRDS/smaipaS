
import React from 'react';
import { ActionButton } from '@/components/ui/action-button';
import StatusBadge from './StatusBadge';
import ScoreBadge from './ScoreBadge';

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

interface StudentTableRowProps {
  student: Student;
  onViewStudentDetails: (student: Student) => void;
}

const StudentTableRow: React.FC<StudentTableRowProps> = ({ student, onViewStudentDetails }) => {
  const getStatus = (): 'presente' | 'ausente' | 'transferida' => {
    if (student.transferida) return 'transferida';
    return student.presente ? 'presente' : 'ausente';
  };

  return (
    <tr key={student.id} className="border-b">
      <td className="p-2 font-medium">{student.nome}</td>
      <td className="p-2 text-center">
        <StatusBadge status={getStatus()} />
      </td>
      <td className="p-2 text-center">
        <ScoreBadge score={student.portugues} />
      </td>
      <td className="p-2 text-center">
        <ScoreBadge score={student.matematica} />
      </td>
      <td className="p-2 text-center">
        <ScoreBadge score={student.media} />
      </td>
      <td className="p-2 text-right">
        <ActionButton 
          action="view" 
          onClick={() => onViewStudentDetails(student)}
          disabled={!student.presente}
        />
      </td>
    </tr>
  );
};

export default StudentTableRow;
