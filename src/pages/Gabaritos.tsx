import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import CadastrarGabarito from '@/components/gabaritos/CadastrarGabarito';
import ImportarGabarito from '@/components/gabaritos/ImportarGabarito';
import ConsultarGabaritos from '@/components/gabaritos/ConsultarGabaritos';

const Gabaritos = () => {
  const [componente, setComponente] = useState('');
  const [ano, setAno] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [numQuestoes, setNumQuestoes] = useState('');
  const [gabarito, setGabarito] = useState<{ resposta: string, codigoDescritor: string }[]>([]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gabaritos</h1>
          <p className="text-muted-foreground">
            Gerencie os gabaritos das avaliações aplicadas
          </p>
        </div>
        
        <Tabs defaultValue="cadastrar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cadastrar">Cadastrar Gabarito</TabsTrigger>
            <TabsTrigger value="importar">Importar Gabarito</TabsTrigger>
            <TabsTrigger value="consultar">Consultar Gabaritos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cadastrar" className="space-y-4">
            <CadastrarGabarito
              componente={componente}
              setComponente={setComponente}
              ano={ano}
              setAno={setAno}
              avaliacao={avaliacao}
              setAvaliacao={setAvaliacao}
            />
          </TabsContent>
          
          <TabsContent value="importar" className="space-y-4">
            <ImportarGabarito
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
          
          <TabsContent value="consultar" className="space-y-4">
            <ConsultarGabaritos
              componente={componente}
              setComponente={setComponente}
              ano={ano}
              setAno={setAno}
              avaliacao={avaliacao}
              setAvaliacao={setAvaliacao}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Gabaritos;