import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import RadarChartComponent from '@/components/charts/RadarChart';
import { Button } from '@/components/ui/button';
import { FileText, FileDown, FileSpreadsheet } from 'lucide-react';
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface StudentDetailsViewProps {
  student: {
    id: string;
    nome: string;
    presente: boolean;
    portugues: number | null;
    matematica: number | null;
    media: number | null;
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
  };
}

const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({ student }) => {
  if (!student.presente || !student.descritores) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Não há dados disponíveis para este aluno.
          {!student.presente && " O aluno não estava presente durante a avaliação."}
        </p>
      </div>
    );
  }

  const radarData = [
    { name: 'Português', value: student.portugues || 0 },
    { name: 'Matemática', value: student.matematica || 0 }
  ];

  const handleExportStudentReport = (format: 'excel' | 'pdf') => {
    const fileName = `relatorio_${student.nome.toLowerCase().replace(/\s+/g, '_')}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    
    let content = '';
    
    if (format === 'excel') {
      content = 'Dados do aluno ' + student.nome + '\r\n\r\n';
      content += 'Componente\tPercentual\tNível\r\n';
      content += `Português\t${student.portugues}%\t${(student.portugues || 0) >= 70 ? 'Adequado' : (student.portugues || 0) >= 60 ? 'Básico' : 'Em desenvolvimento'}\r\n`;
      content += `Matemática\t${student.matematica}%\t${(student.matematica || 0) >= 70 ? 'Adequado' : (student.matematica || 0) >= 60 ? 'Básico' : 'Em desenvolvimento'}\r\n`;
      content += `Média\t${student.media}%\t${(student.media || 0) >= 70 ? 'Adequado' : (student.media || 0) >= 60 ? 'Básico' : 'Em desenvolvimento'}\r\n`;
      
      content += '\r\nDescritores de Português\r\n';
      content += 'Código\tDescritor\tPercentual\r\n';
      
      if (student.descritores?.portugues) {
        student.descritores.portugues.forEach(desc => {
          content += `${desc.codigo}\t${desc.nome}\t${desc.percentual}%\r\n`;
        });
      }
      
      content += '\r\nDescritores de Matemática\r\n';
      content += 'Código\tDescritor\tPercentual\r\n';
      
      if (student.descritores?.matematica) {
        student.descritores.matematica.forEach(desc => {
          content += `${desc.codigo}\t${desc.nome}\t${desc.percentual}%\r\n`;
        });
      }
    } else {
      content = 'Relatório de desempenho - ' + student.nome + '\r\n\r\n';
      content += 'Português: ' + student.portugues + '% - ';
      content += (student.portugues || 0) >= 70 ? 'Adequado\r\n' : (student.portugues || 0) >= 60 ? 'Básico\r\n' : 'Em desenvolvimento\r\n';
      
      content += 'Matemática: ' + student.matematica + '% - ';
      content += (student.matematica || 0) >= 70 ? 'Adequado\r\n' : (student.matematica || 0) >= 60 ? 'Básico\r\n' : 'Em desenvolvimento\r\n';
      
      content += 'Média: ' + student.media + '% - ';
      content += (student.media || 0) >= 70 ? 'Adequado\r\n\r\n' : (student.media || 0) >= 60 ? 'Básico\r\n\r\n' : 'Em desenvolvimento\r\n\r\n';
      
      content += 'DESCRITORES DE PORTUGUÊS:\r\n';
      if (student.descritores?.portugues) {
        student.descritores.portugues.forEach(desc => {
          content += `${desc.codigo} - ${desc.nome}: ${desc.percentual}%\r\n`;
        });
      }
      
      content += '\r\nDESCRITORES DE MATEMÁTICA:\r\n';
      if (student.descritores?.matematica) {
        student.descritores.matematica.forEach(desc => {
          content += `${desc.codigo} - ${desc.nome}: ${desc.percentual}%\r\n`;
        });
      }
    }
    
    const mimeType = format === 'excel' 
      ? 'text/csv;charset=utf-8'
      : 'application/pdf';
    
    const blob = new Blob([content], { type: mimeType });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Relatório de ${student.nome} baixado como ${format.toUpperCase()}`, {
      description: `Arquivo ${fileName} salvo na pasta de downloads`
    });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Português</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {student.portugues}%
            </div>
            <p className={`text-sm ${
              (student.portugues || 0) >= 70 ? 'text-green-600' : 
              (student.portugues || 0) >= 60 ? 'text-blue-600' : 
              'text-orange-600'
            }`}>
              {(student.portugues || 0) >= 70 ? 'Adequado' : 
               (student.portugues || 0) >= 60 ? 'Básico' : 
               'Em desenvolvimento'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Matemática</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {student.matematica}%
            </div>
            <p className={`text-sm ${
              (student.matematica || 0) >= 70 ? 'text-green-600' : 
              (student.matematica || 0) >= 60 ? 'text-blue-600' : 
              'text-orange-600'
            }`}>
              {(student.matematica || 0) >= 70 ? 'Adequado' : 
               (student.matematica || 0) >= 60 ? 'Básico' : 
               'Em desenvolvimento'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Média Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {student.media}%
            </div>
            <p className={`text-sm ${
              (student.media || 0) >= 70 ? 'text-green-600' : 
              (student.media || 0) >= 60 ? 'text-blue-600' : 
              'text-orange-600'
            }`}>
              {(student.media || 0) >= 70 ? 'Adequado' : 
               (student.media || 0) >= 60 ? 'Básico' : 
               'Em desenvolvimento'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="h-64">
        <CardTitle className="text-lg mb-4">Visão Geral do Desempenho</CardTitle>
        <RadarChartComponent 
          data={radarData} 
          dataKey="value" 
          nameKey="name" 
        />
      </div>
      
      <Tabs defaultValue="portugues" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="portugues">Língua Portuguesa</TabsTrigger>
          <TabsTrigger value="matematica">Matemática</TabsTrigger>
        </TabsList>
        
        <TabsContent value="portugues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Descritor - Português</CardTitle>
              <CardDescription>
                Percentual de acerto em cada descritor avaliado
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={student.descritores.portugues || []} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis 
                    type="category" 
                    dataKey="nome" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, '']} />
                  <Legend />
                  <Bar 
                    dataKey="percentual" 
                    name="Percentual de Acerto" 
                    fill="#1E88E5"
                    background={{ fill: '#eee' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="matematica" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Descritor - Matemática</CardTitle>
              <CardDescription>
                Percentual de acerto em cada descritor avaliado
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={student.descritores.matematica || []} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis 
                    type="category" 
                    dataKey="nome" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, '']} />
                  <Legend />
                  <Bar 
                    dataKey="percentual" 
                    name="Percentual de Acerto" 
                    fill="#26A69A"
                    background={{ fill: '#eee' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <FileText className="h-5 w-5 mr-2" />
              Exportar Relatório Individual
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExportStudentReport('excel')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span>Baixar como Excel</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportStudentReport('pdf')}>
              <FileDown className="h-4 w-4 mr-2" />
              <span>Baixar como PDF</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default StudentDetailsView;
