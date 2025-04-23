import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Aluno } from '@/types/alunos';
import { toast } from 'sonner';

interface AlunosListProps {
  alunos: Aluno[];
  onEdit: (aluno: Aluno) => void;
  onDelete: (aluno: Aluno) => void;
}

const AlunosList = ({ alunos, onEdit, onDelete }: AlunosListProps) => {
  const handleDelete = (aluno: Aluno) => {
    toast("Confirmar exclusão", {
      description: "Tem certeza que deseja excluir este aluno?",
      action: {
        label: "Excluir",
        onClick: () => onDelete(aluno)
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}
      }
    });
  };

  return (
    <div className="space-y-4">
      {alunos.map((aluno) => (
        <Card key={aluno.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{aluno.nome}</h3>
              <p className="text-sm text-gray-500">Matrícula: {aluno.matricula}</p>
              <p className="text-sm text-gray-500">Turma: {aluno.turma?.nome}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(aluno)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(aluno)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AlunosList; 