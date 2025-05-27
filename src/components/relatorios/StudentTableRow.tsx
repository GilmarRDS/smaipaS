import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

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
  onViewDetails: () => void;
}

const StudentTableRow: React.FC<StudentTableRowProps> = ({ student, onViewDetails }) => {
  const getStatus = (): 'presente' | 'ausente' | 'transferida' => {
    if (student.transferida) return 'transferida';
    return student.presente ? 'presente' : 'ausente';
  };

  const formatGrade = (grade: number | null) => {
    if (grade === null) return '-';
    return `${grade.toFixed(1)}%`;
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-muted-foreground';
    if (grade >= 70) return 'text-green-600';
    if (grade >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{student.nome}</span>
          <StatusBadge status={getStatus()} />
        </div>
      </td>
      <td className={`p-4 ${getGradeColor(student.portugues)}`}>
        {formatGrade(student.portugues)}
      </td>
      <td className={`p-4 ${getGradeColor(student.matematica)}`}>
        {formatGrade(student.matematica)}
      </td>
      <td className={`p-4 ${getGradeColor(student.media)}`}>
        {formatGrade(student.media)}
      </td>
      <td className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetails}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          <span>Detalhes</span>
        </Button>
      </td>
    </tr>
  );
};

export default StudentTableRow;
