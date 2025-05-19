import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Descritor } from '@/types/descritores';
import { toast } from 'sonner';

interface DescritoresListProps {
  descritores: Descritor[];
  onEdit: (descritor: Descritor) => void;
  onDelete: (descritor: Descritor) => void;
}

export function DescritoresList({ descritores, onEdit, onDelete }: DescritoresListProps) {
  const handleDelete = (descritor: Descritor) => {
    toast("Confirmar exclusão", {
      description: "Tem certeza que deseja excluir este descritor?",
      action: {
        label: "Excluir",
        onClick: () => onDelete(descritor)
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}
      }
    });
  };

  return (
    <div className="space-y-4">
      {descritores.map((descritor) => (
        <Card key={descritor.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{descritor.codigo}</h3>
              <p className="text-gray-600">{descritor.descricao}</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {descritor.disciplina === 'PORTUGUES' ? 'Português' : 'Matemática'}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {descritor.tipo === 'DIAGNOSTICA_INICIAL' ? 'Diagnóstico Inicial' : 'Diagnóstico Final'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(descritor)}
                title="Editar descritor"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(descritor)}
                title="Excluir descritor"
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