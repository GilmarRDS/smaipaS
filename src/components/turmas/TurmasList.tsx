import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { Turma } from '@/types/turmas';
import { toast } from 'sonner';

interface TurmasListProps {
  turmas: Turma[];
  onEdit: (turma: Turma) => void;
  onDelete: (turma: Turma) => void;
  isLoading?: boolean;
}

const TurmasList = ({ turmas, onEdit, onDelete, isLoading = false }: TurmasListProps) => {
  const getTurnoLabel = (turno: Turma['turno']) => {
    const labels = {
      matutino: 'Matutino',
      vespertino: 'Vespertino',
      noturno: 'Noturno',
      integral: 'Integral'
    };
    return labels[turno];
  };
  
  const handleDelete = (turma: Turma) => {
    toast("Confirmar exclusão", {
      description: "Tem certeza que deseja excluir esta turma?",
      action: {
        label: "Excluir",
        onClick: () => onDelete(turma)
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (turmas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma turma encontrada
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {turmas.map((turma) => (
        <Card key={turma.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{turma.nome}</h3>
              <p className="text-sm text-gray-500">{turma.ano} - {getTurnoLabel(turma.turno)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(turma)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(turma)}
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

export default TurmasList;
