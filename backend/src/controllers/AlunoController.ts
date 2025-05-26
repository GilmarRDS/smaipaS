import { Request as ExpressRequest, Response } from 'express';
// import '../../types/express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { RequestWithUsuario } from '../types/express';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

interface AlunoRow {
  nome?: string;
  Nome?: string;
  matricula?: string;
  dataNascimento?: string | Date | null | undefined;
}

export class AlunoController {
  async criar(request: RequestWithUsuario, response: Response) {
    const { nome, matricula, dataNascimento, turmaId } = request.body;

    // Verificar se a turma existe
    const turma = await prisma.turma.findUnique({
      where: { id: turmaId },
    });

    if (!turma) {
      return response.status(400).json({ error: 'Turma não encontrada' });
    }

    // Se for um usuário da escola, só pode criar alunos para turmas da própria escola
    if (!request.usuario) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Gerar matrícula automática se não for fornecida
    let matriculaFinal = matricula;
    if (!matriculaFinal || matriculaFinal.trim() === '') {
      matriculaFinal = uuidv4().slice(0, 8);
    }

    // Verificar se a matrícula já está em uso
    const matriculaEmUso = await prisma.aluno.findFirst({
      where: { matricula: matriculaFinal },
    });

    if (matriculaEmUso) {
      return response.status(400).json({ error: 'Matrícula já cadastrada' });
    }

    const aluno = await prisma.aluno.create({
      data: {
        nome,
        matricula: matriculaFinal,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        turmaId,
      },
    });

    return response.status(201).json(aluno);
  }

  async listarTodos(request: RequestWithUsuario, response: Response) {
    const { turmaId } = request.params;
    const { escolaId } = request.params;

    // Se for um usuário da escola, só pode ver alunos das turmas da própria escola
    if (request.usuario === undefined) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else {
      // Usando Prisma.AlunoWhereInput ao invés de any
      const where: Prisma.AlunoWhereInput = {};
      
      if (turmaId) {
        where.turmaId = turmaId as string;
      } else {
        // Buscar todas as turmas da escola
        const turmas = await prisma.turma.findMany({
          where: { escolaId: request.usuario?.escolaId ?? '' },
          select: { id: true },
        });
    
        where.turmaId = {
          in: turmas.map(turma => turma.id),
        };
      }

      const alunos = await prisma.aluno.findMany({
        where,
        include: {
          turma: {
            select: {
              id: true,
              nome: true,
              ano: true,
            },
          },
        },
      });

      return response.json(alunos);
    }

    // Se for um usuário da secretaria, pode filtrar por turma ou escola
    // Usando Prisma.AlunoWhereInput ao invés de any
    const where: Prisma.AlunoWhereInput = {};
    
    if (turmaId) {
      where.turmaId = turmaId as string;
    } else if (escolaId) {
      // Buscar todas as turmas da escola
      const turmas = await prisma.turma.findMany({
        where: { escolaId },
        select: { id: true },
      });
  
      where.turmaId = {
        in: turmas.map(turma => turma.id),
      };
    }

    const alunos = await prisma.aluno.findMany({
      where,
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            ano: true,
            escola: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    return response.json(alunos);
  }

  async buscarPorId(request: RequestWithUsuario, response: Response) {
    const { id } = request.params;

    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            ano: true,
            escola: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        respostas: {
          select: {
            id: true,
            avaliacao: {
              select: {
                id: true,
                nome: true,
                tipo: true,
                disciplina: true,
                dataAplicacao: true,
              },
            },
            compareceu: true,
            transferido: true,
          },
        },
      },
    });

    if (!aluno) {
      return response.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Se for um usuário da escola, só pode ver alunos das turmas da própria escola
    if (request.usuario === undefined) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (aluno.turma.escola.id !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    return response.json(aluno);
  }

  async atualizar(request: RequestWithUsuario, response: Response) {
    const { id } = request.params;
    const { nome, matricula, dataNascimento, turmaId } = request.body;

    // Verificar se o aluno existe
    const alunoExistente = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turma: {
          select: {
            escolaId: true,
          },
        },
      },
    });

    if (!alunoExistente) {
      return response.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Se for um usuário da escola, só pode atualizar alunos das turmas da própria escola
    if (!request.usuario) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (alunoExistente.turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    // Se estiver alterando a turma, verificar se a nova turma existe
    if (turmaId && turmaId !== alunoExistente.turmaId) {
      const novaTurma = await prisma.turma.findUnique({
        where: { id: turmaId },
      });

      if (!novaTurma) {
        return response.status(400).json({ error: 'Turma não encontrada' });
      }

      // Se for um usuário da escola, só pode mover alunos para turmas da própria escola
      if (!request.usuario) {
        // continue normally
      } else if (request.usuario.role !== 'escola') {
        // continue normally
      } else if (novaTurma.escolaId !== request.usuario.escolaId) {
        return response.status(403).json({ error: 'Acesso negado' });
      }
    }

    // Se estiver alterando a matrícula, verificar se a nova matrícula já está em uso
    if (matricula && matricula !== alunoExistente.matricula) {
      const matriculaEmUso = await prisma.aluno.findFirst({
        where: { matricula },
      });

      if (matriculaEmUso) {
        return response.status(400).json({ error: 'Matrícula já cadastrada' });
      }
    }

    const aluno = await prisma.aluno.update({
      where: { id },
      data: {
        nome,
        matricula,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        turmaId,
      },
    });

    return response.json(aluno);
  }

  async deletar(request: RequestWithUsuario, response: Response) {
    const { id } = request.params;

    // Verificar se o aluno existe
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        turma: {
          select: {
            escolaId: true,
          },
        },
      },
    });

    if (!aluno) {
      return response.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Se for um usuário da escola, só pode deletar alunos das turmas da própria escola
    if (!request.usuario) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (aluno.turma.escolaId !== request.usuario.escolaId) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.aluno.delete({
      where: { id },
    });

    return response.status(204).send();
  }

  async importarAlunos(request: RequestWithUsuario, response: Response) {
    // LOGS DE DEPURAÇÃO
    console.log('Body recebido:', request.body);
    console.log('Arquivo recebido:', request.file);
    console.log('Headers recebidos:', request.headers);
    console.log('Content-Type:', request.headers['content-type']);
    console.log('Form data:', request.body);

    if (!request.file) {
      console.log('Erro: Nenhum arquivo enviado');
      return response.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { turmaId } = request.body;
    console.log('TurmaId recebido:', turmaId);

    if (!turmaId) {
      console.log('Erro: ID da turma não fornecido');
      // Remover o arquivo temporário se existir
      if (request.file && request.file.path) {
        try {
          fs.unlinkSync(request.file.path);
        } catch (error) {
          console.error('Erro ao remover arquivo temporário:', error);
        }
      }
      return response.status(400).json({ error: 'ID da turma não fornecido' });
    }

    // Verificar se a turma existe
    const turma = await prisma.turma.findUnique({
      where: { id: turmaId },
    });

    if (!turma) {
      console.log('Erro: Turma não encontrada');
      // Remover o arquivo temporário se existir
      if (request.file && request.file.path) {
        try {
          fs.unlinkSync(request.file.path);
        } catch (error) {
          console.error('Erro ao remover arquivo temporário:', error);
        }
      }
      return response.status(400).json({ error: 'Turma não encontrada' });
    }

    // Se for um usuário da escola, só pode importar alunos para turmas da própria escola
    if (!request.usuario) {
      // continue normally
    } else if (request.usuario.role !== 'escola') {
      // continue normally
    } else if (turma.escolaId !== request.usuario.escolaId) {
      console.log('Erro: Acesso negado - Usuário não tem permissão para esta turma');
      // Remover o arquivo temporário se existir
      if (request.file && request.file.path) {
        try {
          fs.unlinkSync(request.file.path);
        } catch (error) {
          console.error('Erro ao remover arquivo temporário:', error);
        }
      }
      return response.status(403).json({ error: 'Acesso negado' });
    }

    try {
      console.log('Tentando ler o arquivo:', request.file.path);
      const workbook = XLSX.readFile(request.file.path, {
        cellDates: true, // Força a leitura de células como datas
        cellNF: false, // Não formata números
        cellText: false // Não converte para texto
      });
      console.log('Arquivo lido com sucesso');
      
      const sheetName = workbook.SheetNames[0];
      console.log('Nome da planilha:', sheetName);
      
      const worksheet = workbook.Sheets[sheetName];
      console.log('Conteúdo bruto da planilha:', JSON.stringify(worksheet, null, 2));
      
      // Configurar opções de leitura
      const data = XLSX.utils.sheet_to_json<AlunoRow>(worksheet, {
        raw: true, // Mantém os tipos originais
        defval: null, // Valor padrão para células vazias
        header: ['nome', 'matricula', 'dataNascimento'], // Força os nomes das colunas
        range: 1, // Pula a primeira linha (cabeçalho)
        dateNF: 'dd/mm/yyyy' // Formato de data esperado
      });
      console.log('Dados lidos da planilha (raw):', JSON.stringify(data, null, 2));

      if (data.length === 0) {
        throw new Error('O arquivo está vazio ou não contém dados válidos');
      }

      // Validar se todos os dados necessários estão presentes
      data.forEach((row, index) => {
        console.log(`\nValidando linha ${index + 2}:`, {
          nome: row.nome,
          matricula: row.matricula,
          dataNascimento: row.dataNascimento,
          tipoDataNascimento: row.dataNascimento ? typeof row.dataNascimento : 'undefined'
        });

        if (!row.nome) {
          throw new Error(`Linha ${index + 2}: Nome é obrigatório`);
        }
        if (!row.dataNascimento) {
          throw new Error(`Linha ${index + 2}: Data de nascimento é obrigatória para o aluno ${row.nome}`);
        }
      });

      const alunos = await Promise.all(
        data.map(async (row, index) => {
          console.log(`\nProcessando linha ${index + 2}:`, {
            nome: row.nome,
            matricula: row.matricula,
            dataNascimento: row.dataNascimento,
            tipoDataNascimento: row.dataNascimento ? typeof row.dataNascimento : 'undefined'
          });

          const matricula = row.matricula || uuidv4().slice(0, 8);
          
          // Tratamento da data de nascimento
          let dataNascimento = null;
          if (row.dataNascimento) {
            // Se já for uma data, usa diretamente
            if (row.dataNascimento instanceof Date) {
              dataNascimento = row.dataNascimento;
              console.log(`Data já é um objeto Date:`, dataNascimento);
            } else {
              // Se for string, tenta converter
              const dataStr = String(row.dataNascimento).trim();
              console.log(`Tentando converter string para data:`, dataStr);
              
              // Tenta converter a data usando o formato brasileiro
              const [dia, mes, ano] = dataStr.split('/').map(Number);
              if (dia && mes && ano) {
                dataNascimento = new Date(ano, mes - 1, dia);
                console.log(`Data convertida do formato brasileiro:`, dataNascimento);
              } else {
                // Se não conseguir no formato brasileiro, tenta o formato padrão
                dataNascimento = new Date(dataStr);
                console.log(`Data convertida do formato padrão:`, dataNascimento);
              }
              
              if (isNaN(dataNascimento.getTime())) {
                throw new Error(`Linha ${index + 2}: Data de nascimento inválida para o aluno ${row.nome}. Use uma data válida no formato DD/MM/AAAA`);
              }
            }
            console.log(`Data final processada:`, dataNascimento);
          }

          const nome = row.nome;
          console.log(`Nome do aluno (linha ${index + 2}):`, nome);

          if (!nome) {
            throw new Error(`Linha ${index + 2}: Nome é obrigatório`);
          }

          const dadosFinais = {
            nome: nome,
            matricula,
            dataNascimento,
            turmaId,
          };
          console.log(`Dados finais para criação (linha ${index + 2}):`, dadosFinais);

          return prisma.aluno.create({
            data: dadosFinais,
          });
        })
      );

      // Remover o arquivo após a importação
      try {
        fs.unlinkSync(request.file.path);
        console.log('Arquivo temporário removido com sucesso');
      } catch (error) {
        console.error('Erro ao remover arquivo temporário:', error);
      }

      return response.status(201).json(alunos);
    } catch (error) {
      console.error('Erro detalhado na importação:', error);
      // Remover o arquivo em caso de erro
      if (request.file && request.file.path) {
        try {
          fs.unlinkSync(request.file.path);
          console.log('Arquivo temporário removido após erro');
        } catch (error) {
          console.error('Erro ao remover arquivo temporário:', error);
        }
      }
      return response.status(400).json({ 
        error: 'Erro ao importar alunos',
        details: error instanceof Error ? error.message : 'Verifique se o arquivo está no formato correto e se todos os campos obrigatórios estão preenchidos'
      });
    }
  }

  async downloadTemplate(request: RequestWithUsuario, response: Response) {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheetData = [
        ['Nome', 'Matricula', 'DataNascimento'], // Headers
        ['João da Silva', '', '15/03/2010'], // Exemplo com matrícula em branco
        ['', '', 'IMPORTANTE:'], // Instrução de formato
        ['', '', '1. Formato da data deve ser DD/MM/AAAA'], // Instrução 1
        ['', '', '2. Use barras (/) como separador'], // Instrução 2
        ['', '', '3. Não deixe espaços extras'], // Instrução 3
        ['', '', '4. Exemplos válidos:'], // Exemplos
        ['', '', '   15/03/2010'], // Exemplo 1
        ['', '', '   01/01/2000'], // Exemplo 2
        ['', '', '   31/12/2015'] // Exemplo 3
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Configurar a largura das colunas
      const colWidths = [
        { wch: 30 }, // Nome
        { wch: 15 }, // Matricula
        { wch: 40 }  // DataNascimento
      ];
      worksheet['!cols'] = colWidths;

      // Adicionar estilo para as células de instrução
      for (let i = 2; i <= 9; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: i, c: 2 }); // Coluna C
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { v: worksheetData[i][2] };
        }
        worksheet[cellRef].s = { font: { color: { rgb: "FF0000" } } }; // Texto em vermelho
      }

      // Forçar todas as células da coluna de data como texto
      for (let i = 1; i < worksheetData.length; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: i, c: 2 }); // Coluna C
        if (worksheet[cellRef]) {
          worksheet[cellRef].t = 's'; // Tipo string
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      response.setHeader('Content-Disposition', 'attachment; filename=alunos_template.xlsx');
      response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      response.send(buffer);

    } catch (error) {
      console.error('Erro ao gerar template de alunos:', error);
      response.status(500).json({ error: 'Erro ao gerar template' });
    }
  }
}