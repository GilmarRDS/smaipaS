import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Avaliacao } from '@/types/avaliacoes';
import { toast } from 'sonner';

interface AvaliacoesListProps {
  avaliacoes: Avaliacao[];
  onEdit: (avaliacao: Avaliacao) => void;
  onDelete: (avaliacao: Avaliacao) => void;
}

export function AvaliacoesList({ avaliacoes, onEdit, onDelete }: AvaliacoesListProps) {
  const handleDelete = (avaliacao: Avaliacao) => {
    toast("Confirmar exclusão", {
      description: "Tem certeza que deseja excluir esta avaliação?",
      action: {
        label: "Excluir",
        onClick: () => onDelete(avaliacao)
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}
      }
    });
  };

  return (
    <div className="space-y-4">
      {avaliacoes.map((avaliacao) => (
        <Card key={avaliacao.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{avaliacao.nome}</h3>
              <p className="text-sm text-gray-500">{avaliacao.descricao}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {avaliacao.componente}
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {avaliacao.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(avaliacao)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(avaliacao)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 