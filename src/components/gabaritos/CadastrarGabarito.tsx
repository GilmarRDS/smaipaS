
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (gabarito.some(alt => alt === '')) {
      toast.error('Preencha todas as alternativas do gabarito');
      return;
    }
    
    // Simulação de salvamento bem-sucedido
    toast.success('Gabarito cadastrado com sucesso!');
    setGabarito(Array(parseInt(numQuestoes, 10)).fill(''));
  };

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
                <SelectItem value="5-ano">5º Ano</SelectItem>
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
        
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium mb-4">Preencha o gabarito:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {gabarito.map((alt, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="font-medium w-8">Q{index + 1}:</span>
                <Select value={alt} onValueChange={(value) => handleAlternativaChange(index, value)}>
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
        
        <Button 
          onClick={handleSalvarGabarito} 
          className="w-full"
          disabled={!turma || !componente || !avaliacao || gabarito.some(alt => alt === '')}
        >
          Salvar Gabarito
        </Button>
      </CardContent>
    </Card>
  );
};

export default CadastrarGabarito;
