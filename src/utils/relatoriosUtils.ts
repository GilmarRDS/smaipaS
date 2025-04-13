
import { TURMAS_MOCK } from '@/types/turmas';

// Original data sets
const originalDesempenhoTurmas = [
  { turma: '5º Ano A', portugues: 72, matematica: 68 },
  { turma: '5º Ano B', portugues: 76, matematica: 65 },
  { turma: '5º Ano C', portugues: 68, matematica: 71 },
  { turma: '9º Ano A', portugues: 65, matematica: 62 },
  { turma: '9º Ano B', portugues: 70, matematica: 66 },
];

const portDescritores = [
  { descritor: 'D01', nome: 'Localizar informações', percentual: 78 },
  { descritor: 'D02', nome: 'Inferir sentido', percentual: 65 },
  { descritor: 'D03', nome: 'Inferir informação', percentual: 58 },
  { descritor: 'D04', nome: 'Identificar tema', percentual: 72 },
  { descritor: 'D05', nome: 'Distinguir fato', percentual: 63 },
];

const matDescritores = [
  { descritor: 'D16', nome: 'Operações básicas', percentual: 76 },
  { descritor: 'D17', nome: 'Frações', percentual: 55 },
  { descritor: 'D18', nome: 'Geometria', percentual: 60 },
  { descritor: 'D19', nome: 'Proporcionalidade', percentual: 68 },
  { descritor: 'D20', nome: 'Estatística', percentual: 71 },
];

const originalEvolucaoDesempenho = [
  { avaliacao: 'Diagnóstica 1/2023', portugues: 62, matematica: 58 },
  { avaliacao: 'Diagnóstica 2/2023', portugues: 65, matematica: 61 },
  { avaliacao: 'Diagnóstica 1/2024', portugues: 70, matematica: 65 },
];

const originalHabilidades = [
  { nome: 'Leitura', percentual: 72 },
  { nome: 'Escrita', percentual: 68 },
  { nome: 'Interpretação', percentual: 66 },
  { nome: 'Cálculo', percentual: 70 },
  { nome: 'Raciocínio Lógico', percentual: 64 },
  { nome: 'Resolução de Problemas', percentual: 62 },
];

export interface FilterOptions {
  escola: string;
  turma: string;
  turno: string;
  componente: string;
  avaliacao: string;
}

export const filterData = (filters: FilterOptions) => {
  let desempenhoTurmas = [...originalDesempenhoTurmas];
  let evolucaoDesempenho = [...originalEvolucaoDesempenho];
  let desempenhoHabilidades = [...originalHabilidades];
  let desempenhoDescritores = filters.componente === 'matematica' 
    ? [...matDescritores] 
    : [...portDescritores];
  
  if (filters.escola !== 'all_escolas') {
    const randomModifier = 0.9 + Math.random() * 0.2;
    
    desempenhoTurmas = desempenhoTurmas.map(item => ({
      ...item,
      portugues: Math.min(100, Math.round(item.portugues * randomModifier)),
      matematica: Math.min(100, Math.round(item.matematica * randomModifier))
    }));
    
    evolucaoDesempenho = evolucaoDesempenho.map(item => ({
      ...item,
      portugues: Math.min(100, Math.round(item.portugues * randomModifier)),
      matematica: Math.min(100, Math.round(item.matematica * randomModifier))
    }));
    
    desempenhoHabilidades = desempenhoHabilidades.map(item => ({
      ...item,
      percentual: Math.min(100, Math.round(item.percentual * randomModifier))
    }));
    
    desempenhoDescritores = desempenhoDescritores.map(item => ({
      ...item,
      percentual: Math.min(100, Math.round(item.percentual * randomModifier))
    }));
  }
  
  if (filters.turma !== 'all_turmas') {
    const selectedTurma = TURMAS_MOCK.find(turma => turma.id === filters.turma);
    
    if (selectedTurma) {
      desempenhoTurmas = desempenhoTurmas.filter(item => 
        item.turma.includes(selectedTurma.ano.toString()) || 
        item.turma.includes(selectedTurma.nome)
      );
      
      if (desempenhoTurmas.length === 0) {
        desempenhoTurmas = [originalDesempenhoTurmas[0]];
      }
      
      const yearModifier = parseInt(selectedTurma.ano) <= 5 ? 0.9 : 1.1;
      
      evolucaoDesempenho = evolucaoDesempenho.map(item => ({
        ...item,
        portugues: Math.min(100, Math.round(item.portugues * yearModifier)),
        matematica: Math.min(100, Math.round(item.matematica * yearModifier))
      }));
      
      desempenhoHabilidades = desempenhoHabilidades.map(item => ({
        ...item,
        percentual: Math.min(100, Math.round(item.percentual * yearModifier))
      }));
    }
  }
  
  if (filters.componente !== 'all_componentes') {
    if (filters.componente === 'portugues') {
      desempenhoTurmas = desempenhoTurmas.map(item => ({
        ...item,
        portugues: item.portugues,
        matematica: item.matematica * 0.7
      }));
      
      evolucaoDesempenho = evolucaoDesempenho.map(item => ({
        ...item,
        portugues: item.portugues,
        matematica: item.matematica * 0.7
      }));
      
      desempenhoHabilidades = desempenhoHabilidades.map(item => {
        if (['Leitura', 'Escrita', 'Interpretação'].includes(item.nome)) {
          return { ...item, percentual: Math.min(100, item.percentual + 5) };
        }
        return item;
      });
    } else if (filters.componente === 'matematica') {
      desempenhoTurmas = desempenhoTurmas.map(item => ({
        ...item,
        portugues: item.portugues * 0.7,
        matematica: item.matematica
      }));
      
      evolucaoDesempenho = evolucaoDesempenho.map(item => ({
        ...item,
        portugues: item.portugues * 0.7,
        matematica: item.matematica
      }));
      
      desempenhoHabilidades = desempenhoHabilidades.map(item => {
        if (['Cálculo', 'Raciocínio Lógico', 'Resolução de Problemas'].includes(item.nome)) {
          return { ...item, percentual: Math.min(100, item.percentual + 5) };
        }
        return item;
      });
    }
  }
  
  if (filters.turno !== 'all_turnos') {
    const turnoModifier = filters.turno === 'matutino' ? 1.05 : 0.95;
    
    desempenhoTurmas = desempenhoTurmas.map(item => ({
      ...item,
      portugues: Math.min(100, Math.round(item.portugues * turnoModifier)),
      matematica: Math.min(100, Math.round(item.matematica * turnoModifier))
    }));
    
    evolucaoDesempenho = evolucaoDesempenho.map(item => ({
      ...item,
      portugues: Math.min(100, Math.round(item.portugues * turnoModifier)),
      matematica: Math.min(100, Math.round(item.matematica * turnoModifier))
    }));
  }
  
  if (filters.avaliacao !== 'all_avaliacoes') {
    const randomOffset = Math.random() * 10 - 5;
    
    desempenhoTurmas = desempenhoTurmas.map(item => ({
      ...item,
      portugues: Math.min(100, Math.max(0, Math.round(item.portugues + randomOffset))),
      matematica: Math.min(100, Math.max(0, Math.round(item.matematica + randomOffset)))
    }));
    
    evolucaoDesempenho = evolucaoDesempenho.map(item => ({
      ...item,
      portugues: Math.min(100, Math.max(0, Math.round(item.portugues + randomOffset))),
      matematica: Math.min(100, Math.max(0, Math.round(item.matematica + randomOffset)))
    }));
    
    desempenhoDescritores = desempenhoDescritores.map(item => ({
      ...item,
      percentual: Math.min(100, Math.max(0, Math.round(item.percentual + randomOffset)))
    }));
  }
  
  return {
    desempenhoTurmas,
    evolucaoDesempenho,
    desempenhoHabilidades,
    desempenhoDescritores
  };
};

export const mockStudentData = [
  { 
    id: '1', 
    nome: 'Ana Silva', 
    presente: true, 
    portugues: 85, 
    matematica: 78, 
    media: 81.5,
    descritores: {
      portugues: [
        { codigo: 'D01', nome: 'Localizar informações', percentual: 90 },
        { codigo: 'D02', nome: 'Inferir sentido', percentual: 75 },
        { codigo: 'D03', nome: 'Inferir informação', percentual: 85 }
      ],
      matematica: [
        { codigo: 'D16', nome: 'Operações básicas', percentual: 80 },
        { codigo: 'D17', nome: 'Frações', percentual: 65 },
        { codigo: 'D18', nome: 'Geometria', percentual: 85 }
      ]
    }
  },
  { 
    id: '2', 
    nome: 'Bruno Oliveira', 
    presente: true, 
    portugues: 72, 
    matematica: 65, 
    media: 68.5,
    descritores: {
      portugues: [
        { codigo: 'D01', nome: 'Localizar informações', percentual: 75 },
        { codigo: 'D02', nome: 'Inferir sentido', percentual: 70 },
        { codigo: 'D03', nome: 'Inferir informação', percentual: 65 }
      ],
      matematica: [
        { codigo: 'D16', nome: 'Operações básicas', percentual: 70 },
        { codigo: 'D17', nome: 'Frações', percentual: 55 },
        { codigo: 'D18', nome: 'Geometria', percentual: 65 }
      ]
    }
  },
  { 
    id: '3', 
    nome: 'Carla Santos', 
    presente: true, 
    portugues: 68, 
    matematica: 62, 
    media: 65,
    descritores: {
      portugues: [
        { codigo: 'D01', nome: 'Localizar informações', percentual: 70 },
        { codigo: 'D02', nome: 'Inferir sentido', percentual: 65 },
        { codigo: 'D03', nome: 'Inferir informação', percentual: 65 }
      ],
      matematica: [
        { codigo: 'D16', nome: 'Operações básicas', percentual: 65 },
        { codigo: 'D17', nome: 'Frações', percentual: 55 },
        { codigo: 'D18', nome: 'Geometria', percentual: 60 }
      ]
    }
  },
  { 
    id: '4', 
    nome: 'Daniel Lima', 
    presente: false, 
    portugues: null, 
    matematica: null, 
    media: null,
    descritores: null
  },
  { 
    id: '5', 
    nome: 'Eduarda Costa', 
    presente: false, 
    portugues: null, 
    matematica: null, 
    media: null,
    transferida: true,
    descritores: null
  }
];
