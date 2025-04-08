
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Escola } from '@/types/escolas';

interface EscolaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEscola: Escola | null;
  onSubmit: (escola: Omit<Escola, 'id'>) => void;
}

const EscolaForm = ({ open, onOpenChange, editingEscola, onSubmit }: EscolaFormProps) => {
  // Form state
  const [nome, setNome] = useState('');
  const [inep, setInep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [diretor, setDiretor] = useState('');

  // Reset form when editing escola changes
  useEffect(() => {
    if (editingEscola) {
      setNome(editingEscola.nome);
      setInep(editingEscola.inep);
      setEndereco(editingEscola.endereco);
      setTelefone(editingEscola.telefone);
      setDiretor(editingEscola.diretor);
    } else {
      setNome('');
      setInep('');
      setEndereco('');
      setTelefone('');
      setDiretor('');
    }
  }, [editingEscola]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!nome || !inep) {
      toast.error('Nome e código INEP são obrigatórios');
      return;
    }

    onSubmit({
      nome,
      inep,
      endereco,
      telefone,
      diretor
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editingEscola ? 'Editar Escola' : 'Cadastrar Nova Escola'}</DialogTitle>
          <DialogDescription>
            Preencha os dados da escola. O código INEP é utilizado para identificação única da escola.
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
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inep" className="text-right">
                Código INEP
              </Label>
              <Input
                id="inep"
                value={inep}
                onChange={(e) => setInep(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endereco" className="text-right">
                Endereço
              </Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">
                Telefone
              </Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="diretor" className="text-right">
                Diretor(a)
              </Label>
              <Input
                id="diretor"
                value={diretor}
                onChange={(e) => setDiretor(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingEscola ? 'Salvar Alterações' : 'Cadastrar Escola'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EscolaForm;
