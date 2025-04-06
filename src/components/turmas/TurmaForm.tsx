
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Turma, Escola, ANOS_ESCOLARES } from '@/types/turmas';

interface TurmaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTurma: Turma | null;
  onSubmit: (data: Omit<Turma, 'id' | 'escola'>) => void;
  escolasDisponiveis: Escola[];
  isSecretaria: boolean;
  defaultEscolaId?: string;
}

const TurmaForm = ({
  open,
  onOpenChange,
  editingTurma,
  onSubmit,
  escolasDisponiveis,
  isSecretaria,
  defaultEscolaId,
}: TurmaFormProps) => {
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');
  const [turno, setTurno] = useState<'matutino' | 'vespertino' | 'noturno' | 'integral'>('matutino');
  const [escolaId, setEscolaId] = useState('');

  // Set form values when editing a turma
  useEffect(() => {
    if (editingTurma) {
      setNome(editingTurma.nome);
      setAno(editingTurma.ano);
      setTurno(editingTurma.turno);
      setEscolaId(editingTurma.escolaId);
    } else {
      setNome('');
      setAno('');
      setTurno('matutino');
      setEscolaId(isSecretaria ? '' : (defaultEscolaId || ''));
    }
  }, [editingTurma, isSecretaria, defaultEscolaId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      nome,
      ano,
      turno,
      escolaId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editingTurma ? 'Editar Turma' : 'Cadastrar Nova Turma'}</DialogTitle>
          <DialogDescription>
            Preencha os dados da turma. Todas as informações são necessárias para o cadastro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="col-span-3"
                placeholder="Ex: 1º Ano A"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ano" className="text-right">
                Ano
              </Label>
              <Select 
                value={ano} 
                onValueChange={setAno}
              >
                <SelectTrigger id="ano" className="col-span-3">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {ANOS_ESCOLARES.map((anoEscolar) => (
                    <SelectItem key={anoEscolar} value={anoEscolar}>
                      {anoEscolar}º Ano
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="turno" className="text-right">
                Turno
              </Label>
              <Select 
                value={turno} 
                onValueChange={(value: 'matutino' | 'vespertino' | 'noturno' | 'integral') => setTurno(value)}
              >
                <SelectTrigger id="turno" className="col-span-3">
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matutino">Matutino</SelectItem>
                  <SelectItem value="vespertino">Vespertino</SelectItem>
                  <SelectItem value="noturno">Noturno</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="escola" className="text-right">
                Escola
              </Label>
              <Select 
                value={escolaId} 
                onValueChange={setEscolaId}
                disabled={!isSecretaria && escolasDisponiveis.length === 1}
              >
                <SelectTrigger id="escola" className="col-span-3">
                  <SelectValue placeholder="Selecione a escola" />
                </SelectTrigger>
                <SelectContent>
                  {escolasDisponiveis.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingTurma ? 'Salvar Alterações' : 'Cadastrar Turma'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TurmaForm;
