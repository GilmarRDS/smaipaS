import { useState } from 'react';
import { Descritor } from '@/types/descritores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DescritorFormProps {
  descritor?: Descritor;
  onSubmit: (descritor: Omit<Descritor, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => void;
  onCancel: () => void;
}

// Tipos visuais usados no Select
type TipoVisual = 'inicial' | 'final';

// Mapeamento entre o que o usuário vê e o que o backend espera
const mapTipoVisualParaBackend = (tipo: TipoVisual): 'DIAGNOSTICA_INICIAL' | 'DIAGNOSTICA_FINAL' =>
  tipo === 'inicial' ? 'DIAGNOSTICA_INICIAL' : 'DIAGNOSTICA_FINAL';

const mapTipoBackendParaVisual = (tipo: 'DIAGNOSTICA_INICIAL' | 'DIAGNOSTICA_FINAL'): TipoVisual =>
  tipo === 'DIAGNOSTICA_FINAL' ? 'final' : 'inicial';

export function DescritorForm({ descritor, onSubmit, onCancel }: DescritorFormProps) {
  const [codigo, setCodigo] = useState(descritor?.codigo || '');
  const [descricao, setDescricao] = useState(descritor?.descricao || '');
  const [disciplina, setDisciplina] = useState<'PORTUGUES' | 'MATEMATICA'>(descritor?.disciplina || 'PORTUGUES');
  const [tipo, setTipo] = useState<TipoVisual>(
    descritor ? mapTipoBackendParaVisual(descritor.tipo) : 'inicial'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      codigo,
      descricao,
      disciplina,
      tipo: mapTipoVisualParaBackend(tipo),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
          Código
        </label>
        <Input
          id="codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="disciplina" className="block text-sm font-medium text-gray-700">
          Disciplina
        </label>
        <Select value={disciplina} onValueChange={(value: 'PORTUGUES' | 'MATEMATICA') => setDisciplina(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a disciplina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PORTUGUES">Português</SelectItem>
            <SelectItem value="MATEMATICA">Matemática</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
          Tipo de Diagnóstico
        </label>
        <Select value={tipo} onValueChange={(value: TipoVisual) => setTipo(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de diagnóstico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inicial">Diagnóstico Inicial</SelectItem>
            <SelectItem value="final">Diagnóstico Final</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {descritor ? 'Atualizar' : 'Criar'} Descritor
        </Button>
      </div>
    </form>
  );
}
