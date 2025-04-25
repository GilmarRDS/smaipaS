import { Turma } from '../types/turmas';
import { Aluno } from '../types/alunos';
import { Avaliacao } from '../types/avaliacoes';

export interface FilterOptions {
  escola: string;
  turma: string;
  turno: string;
  componente: string;
  avaliacao: string;
}

export interface DesempenhoTurma {
  turma: string;
  portugues: number;
  matematica: number;
}

export interface Descritor {
  codigo: string;
  nome: string;
  percentual: number;
}

export interface Habilidade {
  nome: string;
  percentual: number;
}

export interface FilteredData {
  desempenhoTurmas: DesempenhoTurma[];
  evolucaoDesempenho: DesempenhoTurma[];
  desempenhoHabilidades: Habilidade[];
  desempenhoDescritores: Descritor[];
}

export async function filterData(
  filters: FilterOptions,
  turmas: Turma[],
  alunos: Aluno[],
  avaliacoes: Avaliacao[],
  descritoresPort: Descritor[],
  descritoresMat: Descritor[]
): Promise<FilteredData> {
  // Filtra turmas conforme filtros
  let filteredTurmas = turmas;
  if (filters.escola !== 'all_escolas') {
    filteredTurmas = filteredTurmas.filter(t => t.escolaId === filters.escola);
  }
  if (filters.turma !== 'all_turmas') {
    filteredTurmas = filteredTurmas.filter(t => t.id === filters.turma);
  }
  if (filters.turno !== 'all_turnos') {
    filteredTurmas = filteredTurmas.filter(t => t.turno === filters.turno);
  }

  // Exemplo simplificado: calcular desempenho médio por turma (dados fictícios)
  const desempenhoTurmas: DesempenhoTurma[] = filteredTurmas.map(t => ({
    turma: t.nome,
    portugues: Math.floor(Math.random() * 40) + 60, // valor aleatório entre 60 e 100
    matematica: Math.floor(Math.random() * 40) + 60,
  }));

  // Evolução desempenho e habilidades podem ser calculadas similarmente
  const evolucaoDesempenho = desempenhoTurmas; // simplificação
  const desempenhoHabilidades: Habilidade[] = [
    { nome: 'Leitura', percentual: 75 },
    { nome: 'Escrita', percentual: 70 },
    { nome: 'Interpretação', percentual: 65 },
    { nome: 'Cálculo', percentual: 80 },
    { nome: 'Raciocínio Lógico', percentual: 60 },
    { nome: 'Resolução de Problemas', percentual: 55 },
  ];

  // Selecionar descritores conforme componente
  const desempenhoDescritores = filters.componente === 'matematica' ? descritoresMat : descritoresPort;

  return {
    desempenhoTurmas,
    evolucaoDesempenho,
    desempenhoHabilidades,
    desempenhoDescritores,
  };
}
