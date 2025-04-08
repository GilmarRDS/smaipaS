
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avaliacao, formatStatus, getStatusColor } from '@/types/avaliacoes';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { useAuth } from '@/contexts/AuthContext';

interface AvaliacoesTableProps {
  avaliacoes: Avaliacao[];
  onViewDetails: (avaliacao: Avaliacao) => void;
  onStatusChange: (avaliacaoId: string, novoStatus: Avaliacao['status']) => void;
}

const AvaliacoesTable: React.FC<AvaliacoesTableProps> = ({
  avaliacoes,
  onViewDetails,
  onStatusChange,
}) => {
  const { isSecretaria } = useAuth();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Componente</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Período</TableHead>
            <TableHead className="text-center">Questões</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {avaliacoes.map((avaliacao) => (
            <TableRow key={avaliacao.id}>
              <TableCell className="font-medium">{avaliacao.nome}</TableCell>
              <TableCell>
                {avaliacao.componente === 'portugues' ? 'Língua Portuguesa' : 'Matemática'}
              </TableCell>
              <TableCell>{avaliacao.ano}º Ano</TableCell>
              <TableCell>
                {format(new Date(avaliacao.dataInicio), 'dd/MM/yyyy')} a {' '}
                {format(new Date(avaliacao.dataFim), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className="text-center">{avaliacao.numQuestoes}</TableCell>
              <TableCell className="text-center">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(avaliacao.status)}`}>
                  {formatStatus(avaliacao.status)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {isSecretaria && avaliacao.status === 'agendada' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onStatusChange(avaliacao.id, 'em-andamento')}
                    >
                      Iniciar
                    </Button>
                  )}
                  {isSecretaria && avaliacao.status === 'em-andamento' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onStatusChange(avaliacao.id, 'concluida')}
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Finalizar
                    </Button>
                  )}
                  <ActionButton 
                    action="view" 
                    onClick={() => onViewDetails(avaliacao)}
                  />
                  {isSecretaria && avaliacao.status !== 'concluida' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (avaliacao.status !== 'cancelada') {
                          onStatusChange(avaliacao.id, 'cancelada');
                        } else {
                          onStatusChange(avaliacao.id, 'agendada');
                        }
                      }}
                    >
                      {avaliacao.status === 'cancelada' ? 'Restaurar' : 'Cancelar'}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AvaliacoesTable;
