import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import EmptyTableState from './EmptyTableState';
import StudentsTableContent from './StudentsTableContent';
import ExportReportButton from './ExportReportButton';

interface Student {
  id: string;
  nome: string;
  presente: boolean;
  portugues: number | null;
  matematica: number | null;
  media: number | null;
  transferida?: boolean;
  descritores: {
    portugues: Array<{
      codigo: string;
      nome: string;
      percentual: number;
    }> | null;
    matematica: Array<{
      codigo: string;
      nome: string;
      percentual: number;
    }> | null;
  } | null;
}

interface StudentsTableProps {
  students: Student[];
  isTurmaSelected: boolean;
  selectedTurma?: { id: string; nome: string };
  onViewStudentDetails: (student: Student) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  isTurmaSelected,
  selectedTurma,
  onViewStudentDetails,
}) => {
  // Função para determinar a cor do badge baseado no percentual
  const getPerformanceColor = (percentual: number | null) => {
    if (percentual === null) return 'bg-gray-100 text-gray-600';
    if (percentual >= 80) return 'bg-green-100 text-green-800';
    if (percentual >= 60) return 'bg-yellow-100 text-yellow-800';
    if (percentual >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Função para formatar o percentual
  const formatPercentual = (percentual: number | null) => {
    if (percentual === null) return 'N/A';
    return `${percentual.toFixed(1)}%`;
  };

  // Função para calcular a média dos descritores
  const calcularMediaDescritores = (descritores: Array<{ percentual: number }> | null) => {
    if (!descritores || descritores.length === 0) return null;
    const soma = descritores.reduce((acc, curr) => acc + curr.percentual, 0);
    return soma / descritores.length;
  };

  // Função para obter os descritores com melhor e pior desempenho
  const getDescritoresExtremos = (descritores: Array<{ codigo: string; nome: string; percentual: number }> | null) => {
    if (!descritores || descritores.length === 0) return { melhor: null, pior: null };
    
    const ordenados = [...descritores].sort((a, b) => b.percentual - a.percentual);
    return {
      melhor: ordenados[0],
      pior: ordenados[ordenados.length - 1]
    };
  };

  return (
    <Card className="bg-smaipa-50/50 border-smaipa-100">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {selectedTurma ? `Alunos da Turma ${selectedTurma.nome}` : 'Selecione uma turma para ver os alunos'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isTurmaSelected ? (
          <EmptyTableState />
        ) : students.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            Nenhum aluno encontrado para esta turma
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Nome do Aluno</TableHead>
                    <TableHead className="text-center">Português</TableHead>
                    <TableHead className="text-center">Matemática</TableHead>
                    <TableHead className="text-center">Média Geral</TableHead>
                    <TableHead className="text-center">Descritores</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const mediaPortugues = calcularMediaDescritores(student.descritores?.portugues || null);
                    const mediaMatematica = calcularMediaDescritores(student.descritores?.matematica || null);
                    const descritoresPT = getDescritoresExtremos(student.descritores?.portugues || null);
                    const descritoresMAT = getDescritoresExtremos(student.descritores?.matematica || null);

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.nome}</TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col items-center gap-2">
                            <Badge className={getPerformanceColor(student.portugues)}>
                              {formatPercentual(student.portugues)}
                            </Badge>
                            {mediaPortugues !== null && (
                              <div className="w-full">
                                <Progress value={mediaPortugues} className="h-2" />
                                <div className="text-xs text-muted-foreground mt-1">
                                  <div>Média: {mediaPortugues.toFixed(1)}%</div>
                                  {descritoresPT.melhor && (
                                    <div className="text-green-600">
                                      Melhor: {descritoresPT.melhor.codigo} ({descritoresPT.melhor.percentual.toFixed(1)}%)
                                    </div>
                                  )}
                                  {descritoresPT.pior && (
                                    <div className="text-red-600">
                                      Pior: {descritoresPT.pior.codigo} ({descritoresPT.pior.percentual.toFixed(1)}%)
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col items-center gap-2">
                            <Badge className={getPerformanceColor(student.matematica)}>
                              {formatPercentual(student.matematica)}
                            </Badge>
                            {mediaMatematica !== null && (
                              <div className="w-full">
                                <Progress value={mediaMatematica} className="h-2" />
                                <div className="text-xs text-muted-foreground mt-1">
                                  <div>Média: {mediaMatematica.toFixed(1)}%</div>
                                  {descritoresMAT.melhor && (
                                    <div className="text-green-600">
                                      Melhor: {descritoresMAT.melhor.codigo} ({descritoresMAT.melhor.percentual.toFixed(1)}%)
                                    </div>
                                  )}
                                  {descritoresMAT.pior && (
                                    <div className="text-red-600">
                                      Pior: {descritoresMAT.pior.codigo} ({descritoresMAT.pior.percentual.toFixed(1)}%)
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className={getPerformanceColor(student.media)}>
                            {formatPercentual(student.media)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              PT: {student.descritores?.portugues?.length || 0}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              MAT: {student.descritores?.matematica?.length || 0}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            {student.transferida ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                Transferido
                              </Badge>
                            ) : student.presente ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Presente
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700">
                                Ausente
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewStudentDetails(student)}
                            className="hover:bg-smaipa-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <ExportReportButton 
              isTurmaSelected={isTurmaSelected}
              selectedTurma={selectedTurma}
              students={students}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
