
import React from 'react';
import { ClipboardList } from 'lucide-react';
import { Avaliacao, formatStatus } from '@/types/avaliacoes';

interface EmptyAvaliacoesProps {
  activeTab: string;
}

const EmptyAvaliacoes: React.FC<EmptyAvaliacoesProps> = ({ activeTab }) => {
  return (
    <div className="text-center py-6">
      <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-lg font-medium">Nenhuma avaliação encontrada</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {activeTab === 'todas' 
          ? 'Não há avaliações cadastradas no sistema.' 
          : `Não há avaliações com status "${formatStatus(activeTab as Avaliacao['status'])}" no momento.`}
      </p>
    </div>
  );
};

export default EmptyAvaliacoes;
