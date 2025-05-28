import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RadarChartComponent from '@/components/charts/RadarChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentDescriptor {
  codigo: string;
  componente: string;
  acertos: number;
}

interface StudentDescriptorAnalysisProps {
  studentData: Array<{
    id: string;
    nome: string;
    descritores: StudentDescriptor[];
  }>;
  selectedStudent: string;
  onStudentChange: (studentId: string) => void;
  studentSkills: Array<{
    nome: string;
    valor: number;
  }>;
}

const StudentDescriptorAnalysis: React.FC<StudentDescriptorAnalysisProps> = ({
  studentData,
  selectedStudent,
  onStudentChange,
  studentSkills
}) => {
  const colors = ['#1E88E5', '#26A69A', '#66BB6A', '#FFA726', '#EF5350'];

  const handleStudentChange = (value: string) => {
    onStudentChange(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Descritores por Aluno</CardTitle>
        <CardDescription>
          Visualize o desempenho individual dos alunos em cada descritor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Selecione o Aluno:</label>
            <Select value={selectedStudent} onValueChange={handleStudentChange}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {studentData.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && studentSkills.length > 0 && (
            <div className="mt-6">
              <RadarChartComponent
                data={studentSkills}
                dataKey="valor"
                nameKey="nome"
                colors={colors}
              />
            </div>
          )}

          {!selectedStudent && (
            <div className="text-center text-muted-foreground py-8">
              Selecione um aluno para visualizar sua análise de desempenho
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDescriptorAnalysis;
