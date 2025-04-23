import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Avaliacao } from '@/types/avaliacoes';
import { turmasService } from '@/services/turmasService';
import { Turma } from '@/types/turmas';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  componente: z.enum(['portugues', 'matematica']),
  ano: z.string().min(1, 'Ano é obrigatório'),
  numQuestoes: z.number().min(1, 'Número de questões é obrigatório'),
  status: z.enum(['agendada', 'em-andamento', 'concluida', 'cancelada']),
  turmaId: z.string().min(1, 'Turma é obrigatória'),
});

interface AvaliacaoFormProps {
  avaliacao?: Avaliacao | null;
  onSubmit: (data: Partial<Avaliacao>) => void;
  onCancel: () => void;
}

export function AvaliacaoForm({ avaliacao, onSubmit, onCancel }: AvaliacaoFormProps) {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTurmas = async () => {
      if (!user?.schoolId) return;
      
      try {
        setLoading(true);
        const data = await turmasService.listarPorEscola(user.schoolId);
        setTurmas(data);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTurmas();
  }, [user?.schoolId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: avaliacao?.nome || '',
      dataInicio: avaliacao?.dataInicio || new Date().toISOString().split('T')[0],
      dataFim: avaliacao?.dataFim || new Date().toISOString().split('T')[0],
      componente: avaliacao?.componente || 'portugues',
      ano: avaliacao?.ano || '',
      numQuestoes: avaliacao?.numQuestoes || 20,
      status: avaliacao?.status || 'agendada',
      turmaId: avaliacao?.turmaId || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome da avaliação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataFim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Fim</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="componente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Componente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                <SelectTrigger>
                      <SelectValue placeholder="Selecione o componente" />
                </SelectTrigger>
                  </FormControl>
                <SelectContent>
                    <SelectItem value="portugues">Português</SelectItem>
                  <SelectItem value="matematica">Matemática</SelectItem>
                </SelectContent>
              </Select>
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
                    <SelectItem value="5">5º Ano</SelectItem>
                    <SelectItem value="6">6º Ano</SelectItem>
                    <SelectItem value="7">7º Ano</SelectItem>
                    <SelectItem value="8">8º Ano</SelectItem>
                    <SelectItem value="9">9º Ano</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numQuestoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Questões</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="agendada">Agendada</SelectItem>
                    <SelectItem value="em-andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
            </div>

        <FormField
          control={form.control}
          name="turmaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turma</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            {avaliacao ? 'Salvar' : 'Criar'}
                  </Button>
        </div>
      </form>
    </Form>
  );
}
