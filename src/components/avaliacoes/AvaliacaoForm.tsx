
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ANOS_ESCOLARES } from '@/types/turmas';
import { cn } from '@/lib/utils';
import { Avaliacao } from '@/types/avaliacoes';
import { toast } from 'sonner';

interface AvaliacaoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAvaliacao: (avaliacao: Omit<Avaliacao, 'id'>) => void;
}

const AvaliacaoForm: React.FC<AvaliacaoFormProps> = ({
  open,
  onOpenChange,
  onAddAvaliacao,
}) => {
  // Form states
  const [nome, setNome] = useState<string>('');
  const [componente, setComponente] = useState<'portugues' | 'matematica'>('portugues');
  const [ano, setAno] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);
  const [numQuestoes, setNumQuestoes] = useState<string>('20');

  const resetForm = () => {
    setNome('');
    setComponente('portugues');
    setAno('');
    setDataInicio(undefined);
    setDataFim(undefined);
    setNumQuestoes('20');
  };

  const handleAddAvaliacao = () => {
    if (!nome || !componente || !ano || !dataInicio || !dataFim || !numQuestoes) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const novaAvaliacao = {
      nome,
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0],
      componente,
      ano,
      numQuestoes: parseInt(numQuestoes, 10),
      status: 'agendada' as const,
    };

    onAddAvaliacao(novaAvaliacao);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Avaliação</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova avaliação a ser aplicada
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome da Avaliação</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Diagnóstica Inicial - Português - 5º Ano"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="componente">Componente Curricular</Label>
              <Select value={componente} onValueChange={(value: 'portugues' | 'matematica') => setComponente(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portugues">Língua Portuguesa</SelectItem>
                  <SelectItem value="matematica">Matemática</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ano">Ano Escolar</Label>
              <Select value={ano} onValueChange={setAno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ANOS_ESCOLARES.map((anoOpt) => (
                    <SelectItem key={anoOpt} value={anoOpt}>{anoOpt}º Ano</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={setDataInicio}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dataFim">Data de Término</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={setDataFim}
                    initialFocus
                    disabled={(date) => dataInicio ? date < dataInicio : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="numQuestoes">Número de Questões</Label>
            <Select value={numQuestoes} onValueChange={setNumQuestoes}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 questões</SelectItem>
                <SelectItem value="15">15 questões</SelectItem>
                <SelectItem value="20">20 questões</SelectItem>
                <SelectItem value="25">25 questões</SelectItem>
                <SelectItem value="30">30 questões</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAddAvaliacao}>Cadastrar Avaliação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvaliacaoForm;
