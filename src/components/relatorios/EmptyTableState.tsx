
import React from 'react';

const EmptyTableState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-2 text-muted-foreground">Selecione uma turma específica para visualizar o desempenho individual dos alunos</p>
      </div>
    </div>
  );
};

export default EmptyTableState;
