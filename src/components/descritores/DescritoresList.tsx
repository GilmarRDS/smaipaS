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
  const handleDelete = async (descritor: Descritor) => {
    if (window.confirm('Tem certeza que deseja excluir este descritor?')) {
      try {
        await onDelete(descritor);
        toast.success('Descritor excluído com sucesso');
      } catch (error) {
        toast.error('Erro ao excluir descritor');
      }
    }
  };

  return (
    <div className="space-y-4">
      {descritores.map((descritor) => (
        <Card key={descritor.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{descritor.codigo}</h3>
              <p className="text-gray-600 mt-1">{descritor.descricao}</p>
              <div className="mt-2 space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {descritor.disciplina === 'PORTUGUES' ? 'Português' : 'Matemática'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {descritor.tipo === 'DIAGNOSTICA_INICIAL' ? 'Diagnóstica Inicial' : 'Diagnóstica Final'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {descritor.ano}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(descritor)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(descritor)}
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