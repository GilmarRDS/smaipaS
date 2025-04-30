
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CadastrarGabaritoProps {
  turma: string;
  setTurma: (value: string) => void;
  componente: string;
  setComponente: (value: string) => void;
  avaliacao: string;
  setAvaliacao: (value: string) => void;
  numQuestoes: string;
  setNumQuestoes: (value: string) => void;
  gabarito: string[];
  setGabarito: (value: string[]) => void;
}

const alternativas = ['A', 'B', 'C', 'D', 'E'];

const CadastrarGabarito: React.FC<CadastrarGabaritoProps> = ({
  turma,
  setTurma,
  componente,
  setComponente,
  avaliacao,
  setAvaliacao,
  numQuestoes,
  setNumQuestoes,
  gabarito,
  setGabarito,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleNumQuestoesChange = (value: string) => {
    const num = parseInt(value, 10);
    setNumQuestoes(value);
    setGabarito(Array(num).fill(''));
  };
  
  const handleAlternativaChange = (index: number, value: string) => {
    const newGabarito = [...gabarito];
    newGabarito[index] = value;
    setGabarito(newGabarito);
  };
  
  const handleSalvarGabarito = () => {
    if (!turma || !componente || !avaliacao) {
      toast.error('Preencha todos os campos obrigatórios', {
        description: 'Turma, componente curricular e avaliação são obrigatórios'
      });
      return;
    }
    
    if (gabarito.some(alt => alt === '')) {
      toast.error('Preencha todas as alternativas do gabarito', {
        description: 'Todas as questões precisam ter uma alternativa selecionada'
      });
      return;
    }
    
    // Simulação de salvamento
    setIsSaving(true);
    
    const promise = () => new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Gabarito cadastrado com sucesso!'
        });
      }, 2000);
    });
    
    toast.promise(promise, {
      loading: 'Salvando gabarito...',
      success: (data) => {
        setIsSaving(false);
        // Reset form
        setGabarito(Array(parseInt(numQuestoes, 10)).fill(''));
        return 'Gabarito cadastrado com sucesso!';
      },
      error: 'Erro ao salvar gabarito',
    });
  };

  const getCompletionPercentage = (): number => {
    if (gabarito.length === 0) return 0;
    const filled = gabarito.filter(alt => alt !== '').length;
    return Math.round((filled / gabarito.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Gabarito Manualmente</CardTitle>
        <CardDescription>
          Preencha o gabarito manualmente questão por questão
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="turma-manual">Turma</Label>
            <Select value={turma} onValueChange={setTurma}>
              <SelectTrigger id="turma-manual">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-ano">5º Ano</SelectItem>
                <SelectItem value="2-ano">5º Ano</SelectItem>
                <SelectItem value="3-ano">5º Ano</SelectItem>
                <SelectItem value="4-ano">5º Ano</SelectItem>
                <SelectItem value="5-ano">5º Ano</SelectItem>
                <SelectItem value="6-ano">5º Ano</SelectItem>
                <SelectItem value="7-ano">5º Ano</SelectItem>
                <SelectItem value="8-ano">5º Ano</SelectItem>
                <SelectItem value="9-ano">9º Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="componente-manual">Componente Curricular</Label>
            <Select value={componente} onValueChange={setComponente}>
              <SelectTrigger id="componente-manual">
                <SelectValue placeholder="Selecione o componente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portugues">Língua Portuguesa</SelectItem>
                <SelectItem value="matematica">Matemática</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avaliacao-manual">Avaliação</Label>
            <Select value={avaliacao} onValueChange={setAvaliacao}>
              <SelectTrigger id="avaliacao-manual">
                <SelectValue placeholder="Selecione a avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diagnostica-1">Diagnóstica 1</SelectItem>
                <SelectItem value="diagnostica-2">Diagnóstica 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="num-questoes">Número de Questões</Label>
            <Select value={numQuestoes} onValueChange={handleNumQuestoesChange}>
              <SelectTrigger id="num-questoes">
                <SelectValue placeholder="Quantidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 questões</SelectItem>
                <SelectItem value="15">15 questões</SelectItem>
                <SelectItem value="20">20 questões</SelectItem>
                <SelectItem value="25">25 questões</SelectItem>
                <SelectItem value="30">30 questões</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {gabarito.length > 0 && (
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Preencha o gabarito:</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {completionPercentage}% preenchido
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      completionPercentage === 100 
                        ? 'bg-green-500' 
                        : completionPercentage > 50 
                          ? 'bg-blue-500' 
                          : 'bg-amber-500'
                    }`} 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {gabarito.map((alt, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="font-medium w-8 text-sm">Q{index + 1}:</span>
                  <Select 
                    value={alt} 
                    onValueChange={(value) => handleAlternativaChange(index, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="?" />
                    </SelectTrigger>
                    <SelectContent>
                      {alternativas.map(letra => (
                        <SelectItem key={letra} value={letra}>{letra}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {completionPercentage === 100 && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-800" />
            <AlertDescription className="text-green-800">
              Todas as questões preenchidas! Você pode salvar o gabarito.
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleSalvarGabarito} 
          className="w-full"
          disabled={!turma || !componente || !avaliacao || gabarito.some(alt => alt === '') || isSaving}
        >
          {isSaving ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Gabarito
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CadastrarGabarito;
