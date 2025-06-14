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
  turmaId: string;
  nomeTurma: string;
  mediaPortugues: number;
  mediaMatematica: number;
  totalAlunos: number;
  alunos: {
    id: string;
    nome: string;
    desempenho: {
      portugues: number;
      matematica: number;
      habilidades: {
        leitura?: number;
        escrita?: number;
        interpretacao?: number;
        calculo?: number;
        raciocinio?: number;
        resolucao?: number;
      };
    };
  }[];
}

export interface EvolucaoDesempenho {
  avaliacaoId: string;
  nomeAvaliacao: string;
  dataAplicacao: string;
  disciplina: string;
  media: number;
  totalAlunos: number;
  alunosPresentes: number;
  alunosTransferidos: number;
  desempenhoPorDescritor: {
    descritorId: string;
    codigo: string;
    descricao: string;
    acertos: number;
    total: number;
    percentual: number;
  }[];
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
  turmas: DesempenhoTurma[];
  evolucaoDesempenho: EvolucaoDesempenho[];
  desempenhoHabilidades: {
    turmaId: string;
    nomeTurma: string;
    habilidades: {
      leitura?: number;
      escrita?: number;
      interpretacao?: number;
      calculo?: number;
      raciocinio?: number;
      resolucao?: number;
    };
  }[];
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

  // Filtra alunos das turmas selecionadas
  const alunosTurmas = alunos.filter(aluno => 
    filteredTurmas.some(turma => turma.id === aluno.turmaId)
  );

  // Filtra avaliações conforme filtros
  const avaliacoesFiltradas = avaliacoes.filter(avaliacao => {
    if (filters.componente !== 'all_componentes' && 
        avaliacao.disciplina.toLowerCase() !== filters.componente.toLowerCase()) {
      return false;
    }
    if (filters.avaliacao && avaliacao.id !== filters.avaliacao) return false;
    return true;
  });

  // Calcula desempenho por turma
  const desempenhoTurmas: DesempenhoTurma[] = filteredTurmas.map(turma => {
    const alunosTurma = alunosTurmas.filter(a => a.turmaId === turma.id);
    const avaliacoesTurma = avaliacoesFiltradas.filter(a => 
      alunosTurma.some(aluno => aluno.respostas?.some(r => r.avaliacaoId === a.id))
    );

    const desempenhoAlunos = alunosTurma.map(aluno => {
      const respostas = aluno.respostas?.filter(r => 
        avaliacoesTurma.some(a => a.id === r.avaliacaoId)
      ) || [];

      const desempenho = {
        portugues: 0,
        matematica: 0,
        habilidades: {
          leitura: 0,
          escrita: 0,
          interpretacao: 0,
          calculo: 0,
          raciocinio: 0,
          resolucao: 0
        }
      };

      respostas.forEach(resposta => {
        const avaliacao = avaliacoesTurma.find(a => a.id === resposta.avaliacaoId);
        if (!avaliacao) return;

        const acertos = resposta.itens.filter(item => item.correta).length;
        const total = resposta.itens.length;
        const percentual = total > 0 ? (acertos / total) * 100 : 0;

        if (avaliacao.disciplina === 'PORTUGUES') {
          desempenho.portugues = percentual;
          // Calcular habilidades de português
          resposta.itens.forEach(item => {
            if (item.descritor) {
              const codigo = item.descritor.codigo;
              if (codigo.startsWith('LP')) {
                if (codigo.includes('leitura')) desempenho.habilidades.leitura = percentual;
                if (codigo.includes('escrita')) desempenho.habilidades.escrita = percentual;
                if (codigo.includes('interpretacao')) desempenho.habilidades.interpretacao = percentual;
              }
            }
          });
        } else if (avaliacao.disciplina === 'MATEMATICA') {
          desempenho.matematica = percentual;
          // Calcular habilidades de matemática
          resposta.itens.forEach(item => {
            if (item.descritor) {
              const codigo = item.descritor.codigo;
              if (codigo.startsWith('MA')) {
                if (codigo.includes('calculo')) desempenho.habilidades.calculo = percentual;
                if (codigo.includes('raciocinio')) desempenho.habilidades.raciocinio = percentual;
                if (codigo.includes('resolucao')) desempenho.habilidades.resolucao = percentual;
              }
            }
          });
        }
      });

      return {
        id: aluno.id,
        nome: aluno.nome,
        desempenho
      };
    });

    const mediaPortugues = desempenhoAlunos.reduce((acc, aluno) => acc + aluno.desempenho.portugues, 0) / desempenhoAlunos.length;
    const mediaMatematica = desempenhoAlunos.reduce((acc, aluno) => acc + aluno.desempenho.matematica, 0) / desempenhoAlunos.length;

    return {
      turmaId: turma.id,
      nomeTurma: turma.nome,
      mediaPortugues,
      mediaMatematica,
      totalAlunos: alunosTurma.length,
      alunos: desempenhoAlunos
    };
  });

  // Calcula evolução do desempenho
  const evolucaoDesempenho = avaliacoesFiltradas.map(avaliacao => {
    const respostas = alunosTurmas.flatMap(aluno => 
      aluno.respostas?.filter(r => r.avaliacaoId === avaliacao.id) || []
    );

    const alunosPresentes = respostas.filter(r => r.compareceu).length;
    const alunosTransferidos = respostas.filter(r => r.transferido).length;

    const desempenhoPorDescritor = avaliacao.gabarito?.itens.map(item => {
      const acertos = respostas.reduce((acc, resposta) => {
        const itemResposta = resposta.itens.find(i => i.numero === item.numero);
        return acc + (itemResposta?.correta ? 1 : 0);
      }, 0);

      return {
        descritorId: item.descritor?.id || '',
        codigo: item.descritor?.codigo || '',
        descricao: item.descritor?.descricao || '',
        acertos,
        total: respostas.length,
        percentual: respostas.length > 0 ? (acertos / respostas.length) * 100 : 0
      };
    }) || [];

    const media = desempenhoPorDescritor.reduce((acc, d) => acc + d.percentual, 0) / desempenhoPorDescritor.length;

    return {
      avaliacaoId: avaliacao.id,
      nomeAvaliacao: avaliacao.nome,
      dataAplicacao: avaliacao.dataAplicacao,
      disciplina: avaliacao.disciplina,
      media,
      totalAlunos: respostas.length,
      alunosPresentes,
      alunosTransferidos,
      desempenhoPorDescritor
    };
  });

  // Calcula desempenho por habilidades
  const desempenhoHabilidades = desempenhoTurmas.map(turma => {
    const habilidades = {
      leitura: 0,
      escrita: 0,
      interpretacao: 0,
      calculo: 0,
      raciocinio: 0,
      resolucao: 0
    };

    turma.alunos.forEach(aluno => {
      Object.entries(aluno.desempenho.habilidades).forEach(([key, value]) => {
        if (value) {
          habilidades[key as keyof typeof habilidades] += value;
        }
      });
    });

    // Calcular médias
    Object.keys(habilidades).forEach(key => {
      const k = key as keyof typeof habilidades;
      habilidades[k] = turma.alunos.length > 0 ? habilidades[k] / turma.alunos.length : 0;
    });

    return {
      turmaId: turma.turmaId,
      nomeTurma: turma.nomeTurma,
      habilidades
    };
  });

  return {
    turmas: desempenhoTurmas,
    evolucaoDesempenho,
    desempenhoHabilidades
  };
}

function calcularMediaHabilidade(alunos: Aluno[], habilidade: string): number {
  const alunosComHabilidade = alunos.filter(aluno => 
    aluno.habilidades && aluno.habilidades[habilidade] !== undefined
  );
  
  if (alunosComHabilidade.length === 0) return 0;
  
  const soma = alunosComHabilidade.reduce((acc, aluno) => 
    acc + (aluno.habilidades?.[habilidade] || 0), 0
  );
  
  return Math.round(soma / alunosComHabilidade.length);
}

export const processRelatorioData = (
  turmas: Turma[],
  alunos: Aluno[],
  avaliacoes: Avaliacao[],
  filters: FilterOptions
): FilteredData => {
  // Filtrar turmas
  const filteredTurmas = turmas.filter(turma => {
    if (filters.escola && turma.escolaId !== filters.escola) return false;
    if (filters.turma && turma.id !== filters.turma) return false;
    if (filters.turno && turma.turno !== filters.turno) return false;
    return true;
  });

  // Filtrar alunos das turmas selecionadas
  const filteredAlunos = alunos.filter(aluno => 
    filteredTurmas.some(turma => turma.id === aluno.turmaId)
  );

  // Filtrar avaliações
  const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
    if (filters.componente && avaliacao.disciplina !== filters.componente) return false;
    if (filters.avaliacao && avaliacao.id !== filters.avaliacao) return false;
    return true;
  });

  // Calcular desempenho por turma
  const desempenhoTurmas = filteredTurmas.map(turma => {
    const alunosTurma = filteredAlunos.filter(aluno => aluno.turmaId === turma.id);
    
    const desempenhoAlunos = alunosTurma.map(aluno => {
      const respostas = aluno.respostas?.filter(r => 
        filteredAvaliacoes.some(a => a.id === r.avaliacaoId)
      ) || [];

      const desempenho = {
        portugues: 0,
        matematica: 0,
        habilidades: {
          leitura: 0,
          escrita: 0,
          interpretacao: 0,
          calculo: 0,
          raciocinio: 0,
          resolucao: 0
        }
      };

      respostas.forEach(resposta => {
        const avaliacao = filteredAvaliacoes.find(a => a.id === resposta.avaliacaoId);
        if (!avaliacao) return;

        const acertos = resposta.itens.filter(item => item.correta).length;
        const total = resposta.itens.length;
        const percentual = total > 0 ? (acertos / total) * 100 : 0;

        if (avaliacao.disciplina === 'PORTUGUES') {
          desempenho.portugues = percentual;
          // Calcular habilidades de português
          resposta.itens.forEach(item => {
            if (item.descritor) {
              const codigo = item.descritor.codigo;
              if (codigo.startsWith('LP')) {
                if (codigo.includes('leitura')) desempenho.habilidades.leitura = percentual;
                if (codigo.includes('escrita')) desempenho.habilidades.escrita = percentual;
                if (codigo.includes('interpretacao')) desempenho.habilidades.interpretacao = percentual;
              }
            }
          });
        } else if (avaliacao.disciplina === 'MATEMATICA') {
          desempenho.matematica = percentual;
          // Calcular habilidades de matemática
          resposta.itens.forEach(item => {
            if (item.descritor) {
              const codigo = item.descritor.codigo;
              if (codigo.startsWith('MA')) {
                if (codigo.includes('calculo')) desempenho.habilidades.calculo = percentual;
                if (codigo.includes('raciocinio')) desempenho.habilidades.raciocinio = percentual;
                if (codigo.includes('resolucao')) desempenho.habilidades.resolucao = percentual;
              }
            }
          });
        }
      });

      return {
        id: aluno.id,
        nome: aluno.nome,
        desempenho
      };
    });

    const mediaPortugues = desempenhoAlunos.reduce((acc, aluno) => acc + aluno.desempenho.portugues, 0) / desempenhoAlunos.length;
    const mediaMatematica = desempenhoAlunos.reduce((acc, aluno) => acc + aluno.desempenho.matematica, 0) / desempenhoAlunos.length;

    return {
      turmaId: turma.id,
      nomeTurma: turma.nome,
      mediaPortugues,
      mediaMatematica,
      totalAlunos: alunosTurma.length,
      alunos: desempenhoAlunos
    };
  });

  // Calcular evolução do desempenho
  const evolucaoDesempenho = filteredAvaliacoes.map(avaliacao => {
    const respostas = filteredAlunos.flatMap(aluno => 
      aluno.respostas?.filter(r => r.avaliacaoId === avaliacao.id) || []
    );

    const alunosPresentes = respostas.filter(r => r.compareceu).length;
    const alunosTransferidos = respostas.filter(r => r.transferido).length;

    const desempenhoPorDescritor = avaliacao.gabarito?.itens.map(item => {
      const acertos = respostas.reduce((acc, resposta) => {
        const itemResposta = resposta.itens.find(i => i.numero === item.numero);
        return acc + (itemResposta?.correta ? 1 : 0);
      }, 0);

      return {
        descritorId: item.descritor?.id || '',
        codigo: item.descritor?.codigo || '',
        descricao: item.descritor?.descricao || '',
        acertos,
        total: respostas.length,
        percentual: respostas.length > 0 ? (acertos / respostas.length) * 100 : 0
      };
    }) || [];

    const media = desempenhoPorDescritor.reduce((acc, d) => acc + d.percentual, 0) / desempenhoPorDescritor.length;

    return {
      avaliacaoId: avaliacao.id,
      nomeAvaliacao: avaliacao.nome,
      dataAplicacao: avaliacao.dataAplicacao,
      disciplina: avaliacao.disciplina,
      media,
      totalAlunos: respostas.length,
      alunosPresentes,
      alunosTransferidos,
      desempenhoPorDescritor
    };
  });

  // Calcular desempenho por habilidades
  const desempenhoHabilidades = desempenhoTurmas.map(turma => {
    const habilidades = {
      leitura: 0,
      escrita: 0,
      interpretacao: 0,
      calculo: 0,
      raciocinio: 0,
      resolucao: 0
    };

    turma.alunos.forEach(aluno => {
      Object.entries(aluno.desempenho.habilidades).forEach(([key, value]) => {
        if (value) {
          habilidades[key as keyof typeof habilidades] += value;
        }
      });
    });

    // Calcular médias
    Object.keys(habilidades).forEach(key => {
      const k = key as keyof typeof habilidades;
      habilidades[k] = turma.alunos.length > 0 ? habilidades[k] / turma.alunos.length : 0;
    });

    return {
      turmaId: turma.turmaId,
      nomeTurma: turma.nomeTurma,
      habilidades
    };
  });

  return {
    turmas: desempenhoTurmas,
    evolucaoDesempenho,
    desempenhoHabilidades
  };
};
