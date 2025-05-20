import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Aluno } from '@/types/alunos';
import { Turma, Escola } from '@/types/turmas';
import { useAuth } from '@/contexts/AuthContext';
import { escolasService } from '@/services/escolasService';
import { turmasService } from '@/services/turmasService';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  matricula: z.string().optional(),
  escolaId: z.string().optional(),
  turmaId: z.string().min(1, 'Turma é obrigatória'),
  dataNascimento: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((date) => {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    }, 'Data inválida'),
});

interface AlunoFormProps {
  aluno?: Aluno | null;
  turmas: Turma[];
  onSubmit: (data: Partial<Aluno>) => void;
  onCancel: () => void;
}

const AlunoForm = ({ aluno, turmas: turmasProp, onSubmit, onCancel }: AlunoFormProps) => {
  const { user } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>(turmasProp || []);
  const [selectedEscolaId, setSelectedEscolaId] = useState<string>(aluno?.turma?.escola?.id || user?.schoolId || '');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: aluno?.nome || '',
      matricula: aluno?.matricula || '',
      escolaId: selectedEscolaId,
      turmaId: aluno?.turmaId || '',
      dataNascimento: aluno?.dataNascimento || '',
    },
  });

  // Carregar escolas se for secretaria
  useEffect(() => {
    if (user?.role === 'secretaria') {
      escolasService.listar().then(setEscolas);
    }
  }, [user?.role]);

  // Carregar turmas ao selecionar escola
  useEffect(() => {
    if (user?.role === 'secretaria' && selectedEscolaId) {
      turmasService.listarPorEscola(selectedEscolaId).then(setTurmas);
    } else if (user?.role === 'escola' && user.schoolId) {
      turmasService.listarPorEscola(user.schoolId).then(setTurmas);
    }
  }, [selectedEscolaId, user?.role, user?.schoolId]);

  // Atualizar turmaId ao mudar escola
  useEffect(() => {
    if (user?.role === 'secretaria') {
      form.setValue('turmaId', '');
    }
  }, [selectedEscolaId]);

  const handleEscolaChange = (value: string) => {
    setSelectedEscolaId(value);
    form.setValue('escolaId', value);
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const payload: any = {
      nome: data.nome,
      turmaId: data.turmaId,
      dataNascimento: new Date(data.dataNascimento).toISOString().split('T')[0],
    };
    if (data.matricula) payload.matricula = data.matricula;
    if (user?.role === 'secretaria') payload.escolaId = data.escolaId;
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {user?.role === 'secretaria' && (
          <FormField
            control={form.control}
            name="escolaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escola</FormLabel>
                <Select onValueChange={(value) => { field.onChange(value); handleEscolaChange(value); }} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a escola" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do aluno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataNascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="matricula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Número de matrícula" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="turmaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turma</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(turmas || []).map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {aluno ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AlunoForm; 