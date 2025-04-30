// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Button } from '../ui/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '../ui/form';
// import { Input } from '../ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../ui/select';
// import { useAuth } from '../../contexts/AuthContext';
// import { turmasService } from '../../services/turmasService';
// import { escolasService } from '../../services/escolasService';

// // Define tipos correspondentes ao schema
// const tipoAvaliacaoOptions = ['DIAGNOSTICA_INICIAL', 'DIAGNOSTICA_FINAL'];
// const disciplinaOptions = ['PORTUGUES', 'MATEMATICA'];

// const formSchema = z.object({
//   nome: z.string().min(1, 'Nome é obrigatório'),
//   tipo: z.enum(['DIAGNOSTICA_INICIAL', 'DIAGNOSTICA_FINAL']),
//   disciplina: z.enum(['PORTUGUES', 'MATEMATICA']),
//   dataAplicacao: z.string().min(1, 'Data de aplicação é obrigatória'),
//   turmaId: z.string().min(1, 'Turma é obrigatória'),
//   escolaId: z.string().min(1, 'Escola é obrigatória'),
// });

// export function AvaliacaoForm({ avaliacao, onSubmit, onCancel, schoolId }) {
//   const { user } = useAuth();
//   const [turmas, setTurmas] = useState([]);
//   const [escolas, setEscolas] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedEscolaId, setSelectedEscolaId] = useState(schoolId || '');

//   // Inicializa o formulário com valores padrão ou avaliação existente
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       nome: avaliacao?.nome || '',
//       tipo: avaliacao?.tipo || 'DIAGNOSTICA_INICIAL',
//       disciplina: avaliacao?.disciplina || 'PORTUGUES',
//       dataAplicacao: avaliacao?.dataAplicacao 
//         ? new Date(avaliacao.dataAplicacao).toISOString().split('T')[0] 
//         : new Date().toISOString().split('T')[0],
//       turmaId: avaliacao?.turmaId || '',
//       escolaId: avaliacao?.escolaId || selectedEscolaId,
//     },
//   });

//   // Carrega escolas se o usuário for da secretaria
//   useEffect(() => {
//     const loadEscolas = async () => {
//       if (user?.role === 'secretaria') {
//         try {
//           const data = await escolasService.listar();
//           setEscolas(data);
//         } catch (error) {
//           console.error('Erro ao carregar escolas:', error);
//         }
//       }
//     };
    
//     loadEscolas();
//   }, [user]);

//   // Atualiza selectedEscolaId quando a prop schoolId mudar
//   useEffect(() => {
//     if (schoolId) {
//       setSelectedEscolaId(schoolId);
//       form.setValue('escolaId', schoolId);
//     }
//   }, [schoolId, form]);

//   // Carrega turmas quando a escola muda
//   useEffect(() => {
//     const loadTurmas = async () => {
//       if (!selectedEscolaId) {
//         setTurmas([]);
//         return;
//       }
      
//       try {
//         setLoading(true);
//         const data = await turmasService.listarPorEscola(selectedEscolaId);
//         setTurmas(data);
//       } catch (error) {
//         console.error('Erro ao carregar turmas:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadTurmas();
//   }, [selectedEscolaId]);

//   // Reseta o formulário quando avaliacao ou selectedEscolaId mudam
//   useEffect(() => {
//     form.reset({
//       nome: avaliacao?.nome || '',
//       tipo: avaliacao?.tipo || 'DIAGNOSTICA_INICIAL',
//       disciplina: avaliacao?.disciplina || 'PORTUGUES',
//       dataAplicacao: avaliacao?.dataAplicacao 
//         ? new Date(avaliacao.dataAplicacao).toISOString().split('T')[0] 
//         : new Date().toISOString().split('T')[0],
//       turmaId: avaliacao?.turmaId || '',
//       escolaId: avaliacao?.escolaId || selectedEscolaId,
//     });
//   }, [avaliacao, selectedEscolaId, form]);

//   const handleEscolaChange = (value) => {
//     setSelectedEscolaId(value);
//     form.setValue('turmaId', ''); // Reseta a turma quando a escola muda
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         {user?.role === 'secretaria' && (
//           <FormField
//             control={form.control}
//             name="escolaId"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Escola</FormLabel>
//                 <Select 
//                   onValueChange={(value) => {
//                     field.onChange(value);
//                     handleEscolaChange(value);
//                   }} 
//                   defaultValue={field.value}
//                 >
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Selecione a escola" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {escolas.length > 0 ? (
//                       escolas.map((escola) => (
//                         <SelectItem key={escola.id} value={escola.id}>
//                           {escola.nome}
//                         </SelectItem>
//                       ))
//                     ) : (
//                       <div className="p-2 text-sm text-muted-foreground">
//                         Nenhuma escola disponível
//                       </div>
//                     )}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         )}

//         <FormField
//           control={form.control}
//           name="nome"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Nome</FormLabel>
//               <FormControl>
//                 <Input placeholder="Nome da avaliação" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <div className="grid grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="tipo"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Tipo de Avaliação</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Selecione o tipo" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value="DIAGNOSTICA_INICIAL">Diagnóstica Inicial</SelectItem>
//                     <SelectItem value="DIAGNOSTICA_FINAL">Diagnóstica Final</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="disciplina"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Disciplina</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Selecione a disciplina" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value="PORTUGUES">Português</SelectItem>
//                     <SelectItem value="MATEMATICA">Matemática</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <FormField
//           control={form.control}
//           name="dataAplicacao"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Data de Aplicação</FormLabel>
//               <FormControl>
//                 <Input type="date" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="turmaId"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Turma</FormLabel>
//               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Selecione a turma" />
//                   </SelectTrigger>
//                 </FormControl>
//                                   <SelectContent>
//                   {loading ? (
//                     <div className="p-2 text-sm text-muted-foreground">
//                       Carregando...
//                     </div>
//                   ) : turmas.length > 0 ? (
//                     turmas.map((turma) => (
//                       <SelectItem key={turma.id} value={turma.id}>
//                         {turma.nome} - {turma.ano}º Ano ({turma.turno})
//                       </SelectItem>
//                     ))
//                   ) : (
//                     <div className="p-2 text-sm text-muted-foreground">
//                       Nenhuma turma disponível
//                     </div>
//                   )}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <div className="flex justify-end gap-2 pt-4">
//           <Button type="button" variant="outline" onClick={onCancel}>
//             Cancelar
//           </Button>
//           <Button type="submit">
//             {avaliacao ? 'Atualizar' : 'Criar'} Avaliação
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }

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
import { useAuth } from '../../contexts/AuthContext';
import { turmasService } from '../../services/turmasService';
import { escolasService } from '../../services/escolasService';

// Define tipos correspondentes ao schema
const tipoAvaliacaoOptions = ['DIAGNOSTICA_INICIAL', 'DIAGNOSTICA_FINAL'];
const disciplinaOptions = ['PORTUGUES', 'MATEMATICA'];

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['DIAGNOSTICA_INICIAL', 'DIAGNOSTICA_FINAL']),
  disciplina: z.enum(['PORTUGUES', 'MATEMATICA']),
  dataAplicacao: z.string().min(1, 'Data de aplicação é obrigatória'),
  turmaId: z.string().min(1, 'Turma é obrigatória'),
  escolaId: z.string().min(1, 'Escola é obrigatória'),
});

export function AvaliacaoForm({ avaliacao, onSubmit, onCancel, schoolId }) {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscolaId, setSelectedEscolaId] = useState(schoolId || '');

  // Inicializa o formulário com valores padrão ou avaliação existente
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: avaliacao?.nome || '',
      tipo: avaliacao?.tipo || 'DIAGNOSTICA_INICIAL',
      disciplina: avaliacao?.disciplina || 'PORTUGUES',
      dataAplicacao: avaliacao?.dataAplicacao 
        ? new Date(avaliacao.dataAplicacao).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      turmaId: avaliacao?.turmaId || '',
      escolaId: avaliacao?.escolaId || selectedEscolaId,
    },
  });

  // Carrega escolas se o usuário for da secretaria
  useEffect(() => {
    const loadEscolas = async () => {
      if (user?.role === 'secretaria') {
        try {
          const data = await escolasService.listar();
          setEscolas(data);
        } catch (error) {
          console.error('Erro ao carregar escolas:', error);
        }
      }
    };
    
    loadEscolas();
  }, [user]);

  // Atualiza selectedEscolaId quando a prop schoolId mudar
  useEffect(() => {
    if (schoolId) {
      setSelectedEscolaId(schoolId);
      form.setValue('escolaId', schoolId);
    }
  }, [schoolId, form]);

  // Carrega turmas quando a escola muda
  useEffect(() => {
    const loadTurmas = async () => {
      if (!selectedEscolaId) {
        setTurmas([]);
        return;
      }
      
      try {
        setLoading(true);
        const data = await turmasService.listarPorEscola(selectedEscolaId);
        setTurmas(data);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTurmas();
  }, [selectedEscolaId]);

  // Reseta o formulário quando avaliacao mudar (sem o form como dependência)
  useEffect(() => {
    form.reset({
      nome: avaliacao?.nome || '',
      tipo: avaliacao?.tipo || 'DIAGNOSTICA_INICIAL',
      disciplina: avaliacao?.disciplina || 'PORTUGUES',
      dataAplicacao: avaliacao?.dataAplicacao 
        ? new Date(avaliacao.dataAplicacao).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      turmaId: avaliacao?.turmaId || '',
      escolaId: avaliacao?.escolaId || selectedEscolaId,
    });
  }, [avaliacao, selectedEscolaId]); // form removido como dependência

  const handleEscolaChange = (value) => {
    setSelectedEscolaId(value);
    form.setValue('turmaId', ''); // Reseta a turma quando a escola muda
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {user?.role === 'secretaria' && (
          <FormField
            control={form.control}
            name="escolaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escola</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleEscolaChange(value);
                  }} 
                  value={field.value} // Corrigido: usa value em vez de defaultValue
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a escola" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {escolas.length > 0 ? (
                      escolas.map((escola) => (
                        <SelectItem key={escola.id} value={escola.id}>
                          {escola.nome}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        Nenhuma escola disponível
                      </div>
                    )}
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
                  {loading ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Carregando...
                    </div>
                  ) : turmas.length > 0 ? (
                    turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.ano}º Ano ({turma.turno})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhuma turma disponível
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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