import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X } from 'lucide-react';

interface RespostaCardProps {
  aluno: {
    id: string;
    numero: number;
    nome: string;
    respostas: string[];
    ausente: boolean;
    transferido: boolean;
  };
  numQuestoes: number;
  gabarito?: string[]; // Array com as respostas corretas
  onSave: (alunoId: string, respostas: string[], ausente: boolean, transferido: boolean) => Promise<void>;
  onAusenteChange: (alunoId: string, checked: boolean) => void;
  onTransferidoChange: (alunoId: string, checked: boolean) => void;
}

const alternativas = ['A', 'B', 'C', 'D', 'E'];

export const RespostaCard: React.FC<RespostaCardProps> = ({ 
  aluno, 
  numQuestoes,
  gabarito = [], // Valor padrão é array vazio
  onSave,
  onAusenteChange,
  onTransferidoChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [respostas, setRespostas] = useState<string[]>(aluno.respostas);
  const [isSaving, setIsSaving] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);

  // Verifica se o aluno já tem respostas registradas
  const temRespostasRegistradas = aluno.respostas.some(resposta => resposta !== '');

  // Atualiza as respostas quando o aluno mudar
  React.useEffect(() => {
    const novasRespostas = Array(numQuestoes).fill('');
    aluno.respostas.forEach((resposta, index) => {
      if (index < numQuestoes) {
        novasRespostas[index] = resposta;
      }
    });
    setRespostas(novasRespostas);
    setStatusChanged(false);
  }, [aluno.respostas, numQuestoes]);

  const handleRespostaChange = (questaoIndex: number, value: string) => {
    setRespostas(prev => 
      prev.map((resp, i) => (i === questaoIndex ? value : resp))
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(aluno.id, respostas, aluno.ausente, aluno.transferido);
      if (temRespostasRegistradas) {
        setIsEditing(false);
      }
      setStatusChanged(false);
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const novasRespostas = Array(numQuestoes).fill('');
    aluno.respostas.forEach((resposta, index) => {
      if (index < numQuestoes) {
        novasRespostas[index] = resposta;
      }
    });
    setRespostas(novasRespostas);
    setIsEditing(false);
    setStatusChanged(false);
  };

  const handleAusenteChange = (checked: boolean) => {
    onAusenteChange(aluno.id, checked);
    setStatusChanged(true);
  };

  const handleTransferidoChange = (checked: boolean) => {
    onTransferidoChange(aluno.id, checked);
    setStatusChanged(true);
  };

  // Função para determinar a cor da resposta
  const getRespostaColor = (resposta: string, questaoIndex: number) => {
    if (!resposta || !gabarito[questaoIndex]) return 'bg-primary/10 text-primary';
    return resposta === gabarito[questaoIndex] 
      ? 'bg-green-100 text-green-700 border border-green-300' 
      : 'bg-red-100 text-red-700 border border-red-300';
  };

  return (
    <Card className="border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{aluno.numero} - {aluno.nome}</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`ausente-${aluno.id}`}
              checked={aluno.ausente}
              onCheckedChange={handleAusenteChange}
              disabled={aluno.transferido}
            />
            <Label htmlFor={`ausente-${aluno.id}`} className="cursor-pointer">Aluno ausente</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`transferido-${aluno.id}`}
              checked={aluno.transferido}
              onCheckedChange={handleTransferidoChange}
              disabled={aluno.ausente}
            />
            <Label htmlFor={`transferido-${aluno.id}`} className="cursor-pointer">Aluno transferido</Label>
          </div>

          {statusChanged && (
            <Button
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
              Salvar Status
            </Button>
          )}

          {temRespostasRegistradas ? (
            !isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar Respostas
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center gap-2"
                  disabled={isSaving}
                >
                  <Check className="h-4 w-4" />
                  Salvar Todas
                </Button>
              </div>
            )
          ) : (
            <Button
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
              Salvar Respostas
            </Button>
          )}
        </div>
      </div>

      {!aluno.ausente && !aluno.transferido && (
        <div className="mt-4 border rounded-md p-4">
          <h4 className="text-sm font-medium mb-4">Respostas do Aluno:</h4>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: numQuestoes }).map((_, questaoIndex) => (
              <div key={questaoIndex} className="flex flex-col items-center space-y-2">
                <span className="font-medium text-sm">Questão {questaoIndex + 1}:</span>
                {(!temRespostasRegistradas || isEditing) ? (
                  <Select
                    value={respostas[questaoIndex] || ''}
                    onValueChange={(value) => handleRespostaChange(questaoIndex, value)}
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
                ) : (
                  <span className={`px-2 py-1 rounded ${getRespostaColor(respostas[questaoIndex], questaoIndex)}`}>
                    {respostas[questaoIndex] || '-'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}; 