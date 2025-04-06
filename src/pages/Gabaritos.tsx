
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_GABARITOS } from '@/types/gabaritos';

// Components
import ImportarGabarito from '@/components/gabaritos/ImportarGabarito';
import CadastrarGabarito from '@/components/gabaritos/CadastrarGabarito';
import ConsultarGabaritos from '@/components/gabaritos/ConsultarGabaritos';

const Gabaritos: React.FC = () => {
  const [activeTab, setActiveTab] = useState('importar');
  const [turma, setTurma] = useState('');
  const [componente, setComponente] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [numQuestoes, setNumQuestoes] = useState('20');
  const [gabarito, setGabarito] = useState<string[]>(Array(20).fill(''));
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gabaritos</h1>
          <p className="text-muted-foreground">
            Gerencie os gabaritos das avaliações aplicadas
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="importar">Importar Gabarito</TabsTrigger>
            <TabsTrigger value="cadastrar">Cadastrar Gabarito</TabsTrigger>
            <TabsTrigger value="consultar">Consultar Gabaritos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="importar" className="space-y-4">
            <ImportarGabarito
              turma={turma}
              setTurma={setTurma}
              componente={componente}
              setComponente={setComponente}
              avaliacao={avaliacao}
              setAvaliacao={setAvaliacao}
            />
          </TabsContent>
          
          <TabsContent value="cadastrar" className="space-y-4">
            <CadastrarGabarito
              turma={turma}
              setTurma={setTurma}
              componente={componente}
              setComponente={setComponente}
              avaliacao={avaliacao}
              setAvaliacao={setAvaliacao}
              numQuestoes={numQuestoes}
              setNumQuestoes={setNumQuestoes}
              gabarito={gabarito}
              setGabarito={setGabarito}
            />
          </TabsContent>
          
          <TabsContent value="consultar" className="space-y-4">
            <ConsultarGabaritos gabaritos={MOCK_GABARITOS} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Gabaritos;
