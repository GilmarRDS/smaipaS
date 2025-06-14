import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Plus } from 'lucide-react';
import CadastrarGabarito from './CadastrarGabarito';
import ConsultarGabaritos from './ConsultarGabaritos';

const anos = ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano'];

const Gabaritos: React.FC = () => {
  const [componente, setComponente] = useState('');
  const [ano, setAno] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [numQuestoes, setNumQuestoes] = useState('');
  const [gabarito, setGabarito] = useState<string[]>([]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gabaritos</h1>
          <p className="text-muted-foreground">
            Gerencie os gabaritos das avaliações
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="componente">Componente Curricular</Label>
          <Select value={componente} onValueChange={setComponente}>
            <SelectTrigger id="componente">
              <SelectValue placeholder="Selecione o componente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portugues">Língua Portuguesa</SelectItem>
              <SelectItem value="matematica">Matemática</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ano">Ano</Label>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger id="ano">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map(ano => (
                <SelectItem key={ano} value={ano}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="avaliacao">Avaliação</Label>
          <Select value={avaliacao} onValueChange={setAvaliacao}>
            <SelectTrigger id="avaliacao">
              <SelectValue placeholder="Selecione a avaliação" />
            </SelectTrigger>
            <SelectContent>
              {/* As avaliações serão carregadas dinamicamente */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="consultar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consultar" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Consultar
          </TabsTrigger>
          <TabsTrigger value="cadastrar" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Cadastrar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consultar">
          <ConsultarGabaritos
            componente={componente}
            setComponente={setComponente}
            ano={ano}
            setAno={setAno}
            avaliacao={avaliacao}
            setAvaliacao={setAvaliacao}
          />
        </TabsContent>

        <TabsContent value="cadastrar">
          <CadastrarGabarito
            componente={componente}
            setComponente={setComponente}
            ano={ano}
            setAno={setAno}
            avaliacao={avaliacao}
            setAvaliacao={setAvaliacao}
            numQuestoes={numQuestoes}
            setNumQuestoes={setNumQuestoes}
            gabarito={gabarito}
            setGabarito={setGabarito}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Gabaritos; 