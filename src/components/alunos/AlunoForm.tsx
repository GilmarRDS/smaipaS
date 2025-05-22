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
import { Turma } from '@/types/turmas';
import { Escola } from '@/types/escolas';
import useAuth from '@/hooks/useAuth';
import { escolasService } from '@/services/escolasService';
import { turmasService } from '@/services/turmasService';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  matricula: z.string().regex(/^\d*$/, 'A matrícula deve conter apenas números').optional(),
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
  aluno?: Aluno;
  turmas?: Turma[];
  turmaId?: string;
  onSubmit: (data: Partial<Aluno>) => void;
  onCancel?: () => void;
}

const AlunoForm = ({ aluno, turmas: turmasProp, turmaId, onSubmit, onCancel }: AlunoFormProps) => {
  const { user } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>(turmasProp || []);
  const [selectedEscolaId, setSelectedEscolaId] = useState<string>(aluno?.turmaId ? aluno.turmaId : user?.schoolId || '');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: aluno?.nome || '',
      matricula: aluno?.matricula || '',
      escolaId: selectedEscolaId,
      turmaId: turmaId || aluno?.turmaId || '',
      dataNascimento: aluno?.dataNascimento || '',
    },
  });

  // Carregar escolas se for secretaria
  useEffect(() => {
    const carregarEscolas = async () => {
      if (user?.role === 'secretaria') {
        try {
          const escolasData = await escolasService.listar();
          setEscolas(escolasData);
        } catch (error) {
          console.error('Erro ao carregar escolas:', error);
        }
      }
    };
    carregarEscolas();
  }, [user?.role]);

  // Carregar turmas ao selecionar escola ou quando o usuário for da escola
  useEffect(() => {
    const carregarTurmas = async () => {
      try {
        if (user?.role === 'secretaria' && selectedEscolaId) {
          const turmasData = await turmasService.listar(selectedEscolaId);
          setTurmas(turmasData);
        } else if (user?.role === 'escola' && user.schoolId) {
          const turmasData = await turmasService.listar(user.schoolId);
          setTurmas(turmasData);
        }
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      }
    };
    carregarTurmas();
  }, [selectedEscolaId, user?.role, user?.schoolId]);

  // Atualizar turmaId ao mudar escola
  useEffect(() => {
    if (user?.role === 'secretaria') {
      form.setValue('turmaId', '');
    }
  }, [selectedEscolaId, form, user?.role]);

  const handleEscolaChange = (value: string) => {
    setSelectedEscolaId(value);
    form.setValue('escolaId', value);
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const payload: Partial<Aluno> = {
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
                <Select onValueChange={handleEscolaChange} value={field.value}>
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
                <Input type="number" placeholder="Número de matrícula" {...field} />
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
                  {turmas.map((turma) => (
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