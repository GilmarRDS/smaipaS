import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import useAuth from '@/hooks/useAuth';
import { turmasService } from '../../services/turmasService';
import { escolasService } from '../../services/escolasService';

// Define tipos correspondentes ao schema
const tipoAvaliacaoOptions = ['DIAGNOSTICA_INICIAL', 'DIAGNOSTICA_FINAL'];
const disciplinaOptions = ['PORTUGUES', 'MATEMATICA'];

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['DIAGNOSTICA_INICIAL', 'DIAGNOSTICA_FINAL']),
  disciplina: z.enum(['PORTUGUES', 'MATEMATICA']),
  ano: z.string().min(1, 'Ano é obrigatório'),
  dataAplicacao: z.string().min(1, 'Data de aplicação é obrigatória'),
});

export function AvaliacaoForm({ avaliacao, onSubmit, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Inicializa o formulário com valores padrão ou avaliação existente
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: avaliacao?.nome || '',
      tipo: avaliacao?.tipo || 'DIAGNOSTICA_INICIAL',
      disciplina: avaliacao?.disciplina || 'PORTUGUES',
      ano: avaliacao?.ano || '',
      dataAplicacao: avaliacao?.dataAplicacao 
        ? new Date(avaliacao.dataAplicacao).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
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
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Avaliação</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DIAGNOSTICA_INICIAL">Diagnóstica Inicial</SelectItem>
                    <SelectItem value="DIAGNOSTICA_FINAL">Diagnóstica Final</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="disciplina"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Disciplina</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a disciplina" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PORTUGUES">Português</SelectItem>
                    <SelectItem value="MATEMATICA">Matemática</SelectItem>
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
            name="ano"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano/Série</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1º Ano</SelectItem>
                    <SelectItem value="2">2º Ano</SelectItem>
                    <SelectItem value="3">3º Ano</SelectItem>
                    <SelectItem value="4">4º Ano</SelectItem>
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

          <FormField
            control={form.control}
            name="dataAplicacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Aplicação</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {avaliacao ? 'Atualizar' : 'Criar'} Avaliação
          </Button>
        </div>
      </form>
    </Form>
  );
}