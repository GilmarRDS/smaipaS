import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RadarChartComponent from '@/components/charts/RadarChart';

interface StudentDescriptor {
  codigo: string;
  componente: string;
  acertos: number;
}

interface StudentData {
  aluno: string;
  alunoId: string;
  turmaId: string;
  turmaNome: string;
  descritores: StudentDescriptor[];
}

interface StudentDescriptorAnalysisProps {
  studentData: StudentData[];
  selectedStudent: string;
  onStudentChange: (student: string) => void;
  studentSkills: Array<{ descritor: string; percentual: number }>;
}

const StudentDescriptorAnalysis: React.FC<StudentDescriptorAnalysisProps> = ({ 
  studentData, 
  selectedStudent, 
  onStudentChange,
  studentSkills
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Descritores Problemáticos por Aluno</CardTitle>
        <CardDescription>
          Análise das dificuldades individuais dos alunos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label htmlFor="aluno-select" className="text-sm font-medium">Selecione um aluno:</label>
            <select 
              id="aluno-select" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedStudent}
              onChange={(e) => onStudentChange(e.target.value)}
            >
              {studentData.map(aluno => (
                <option key={aluno.alunoId} value={aluno.aluno}>
                  {aluno.aluno} - {aluno.turmaNome}
                </option>
              ))}
            </select>
          </div>
          
          {selectedStudent && (
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Desempenho nos Descritores:</h4>
              
              {/* Radar Chart for student skills */}
              <div className="h-60">
                <RadarChartComponent 
                  data={studentSkills}
                  dataKey="percentual"
                  nameKey="descritor"
                  colors={["#7C3AED", "#8B5CF6"]}
                />
              </div>
              
              {/* Table of descriptors */}
              <div className="mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2">Descritor</th>
                      <th className="text-left pb-2">Componente</th>
                      <th className="text-right pb-2">% Acertos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentData.find(a => a.aluno === selectedStudent)?.descritores.map(descritor => (
                      <tr key={descritor.codigo} className="border-b">
                        <td className="py-2">{descritor.codigo}</td>
                        <td className="py-2">{descritor.componente}</td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-0.5 rounded-full ${
                            descritor.acertos < 30 ? 'bg-red-100 text-red-800' : 
                            descritor.acertos < 50 ? 'bg-orange-100 text-orange-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {descritor.acertos}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDescriptorAnalysis;
