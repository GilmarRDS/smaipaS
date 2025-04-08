
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avaliacao, formatStatus, getStatusColor } from '@/types/avaliacoes';
import { format } from 'date-fns';
import { FileText, ListFilter, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AvaliacaoDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avaliacao: Avaliacao | null;
}

const AvaliacaoDetails: React.FC<AvaliacaoDetailsProps> = ({ 
  open, 
  onOpenChange, 
  avaliacao 
}) => {
  const { isSecretaria } = useAuth();

  if (!avaliacao) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Avaliação</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre a avaliação selecionada
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
              <p className="text-base font-semibold">{avaliacao.nome}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs ${getStatusColor(avaliacao.status)}`}>
                {formatStatus(avaliacao.status)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Componente</h3>
              <p className="text-base">{avaliacao.componente === 'portugues' ? 'Língua Portuguesa' : 'Matemática'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Ano Escolar</h3>
              <p className="text-base">{avaliacao.ano}º Ano</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Questões</h3>
              <p className="text-base">{avaliacao.numQuestoes}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Data de Início</h3>
              <p className="text-base">{format(new Date(avaliacao.dataInicio), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Data de Término</h3>
              <p className="text-base">{format(new Date(avaliacao.dataFim), 'dd/MM/yyyy')}</p>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-medium">Informações Adicionais</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                <FileText className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-medium">Gabaritos</span>
                <span className="text-lg font-bold">1</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                <Users className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-medium">Alunos</span>
                <span className="text-lg font-bold">32</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                <ListFilter className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-medium">Descritores</span>
                <span className="text-lg font-bold">8</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          {isSecretaria && (
            <Button
              onClick={() => {
                onOpenChange(false);
                toast.success('Redirecionando para relatórios', {
                  description: 'Relatórios da avaliação estão sendo carregados'
                });
              }}
            >
              Ver Relatórios
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvaliacaoDetails;
