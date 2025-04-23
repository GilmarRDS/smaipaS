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
        <div key={descritor.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{descritor.codigo}</h3>
              <p className="text-gray-600">{descritor.descricao}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {descritor.disciplina}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {descritor.tipo === 'inicial' ? 'Diagnóstico Inicial' : 'Diagnóstico Final'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 