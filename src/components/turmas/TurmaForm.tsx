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
import { Turma } from '@/types/turmas';
import useAuth from '@/hooks/useAuth';
import { escolasService } from '@/services/escolasService';
import { Escola } from '@/types/escolas';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  ano: z.string().min(1, 'Ano é obrigatório'),
  turno: z.enum(['matutino', 'vespertino', 'noturno', 'integral']),
  escolaId: z.string().min(1, 'Escola é obrigatória'),
});

interface TurmaFormProps {
  turma?: Turma | null;
  onSubmit: (data: Partial<Turma>) => void;
  onCancel: () => void;
}

const ANOS_ESCOLARES = ['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'];

const TurmaForm = ({ turma, onSubmit, onCancel }: TurmaFormProps) => {
  const { user } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: turma?.nome || '',
      ano: turma?.ano || '',
      turno: turma?.turno || 'matutino',
      escolaId: user?.role === 'secretaria' ? '' : user?.schoolId,
    },
  });

  useEffect(() => {
    const carregarEscolas = async () => {
      if (user?.role === 'secretaria') {
        try {
          setIsLoading(true);
          const escolasData = await escolasService.listar();
          setEscolas(escolasData);
        } catch (error) {
          console.error('Erro ao carregar escolas:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    carregarEscolas();
  }, [user?.role]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({
      ...data,
      escolaId: user?.role === 'secretaria' ? data.escolaId : user?.schoolId,
    });
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Input placeholder="Nome da turma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ano"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ANOS_ESCOLARES.map((ano) => (
                    <SelectItem key={ano} value={ano}>
                      {ano} Ano
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="turno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turno</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="matutino">Matutino</SelectItem>
                  <SelectItem value="vespertino">Vespertino</SelectItem>
                  <SelectItem value="noturno">Noturno</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
};

export default TurmaForm;
