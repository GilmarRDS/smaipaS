import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// Components
import ImportarGabarito from '../components/gabaritos/ImportarGabarito';
import CadastrarGabarito from '../components/gabaritos/CadastrarGabarito';
import ConsultarGabaritos from '../components/gabaritos/ConsultarGabaritos';

// Serviço para buscar os dados do banco
import { gabaritosService } from '../services/gabaritosService';

// Interface que corresponde ao formato esperado pelo ConsultarGabaritos
interface GabaritoMock {
  id: string;
  avaliacao: string;
  data: string;
  questoes: number;
}

const Gabaritos: React.FC = () => {
  const [activeTab, setActiveTab] = useState('importar');
  const [turma, setTurma] = useState('');
  const [componente, setComponente] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [numQuestoes, setNumQuestoes] = useState('20');
  const [gabarito, setGabarito] = useState<string[]>(Array(20).fill(''));
  const [gabaritosDB, setGabaritosDB] = useState<GabaritoMock[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Buscar dados do banco ao carregar o componente
  useEffect(() => {
    const buscarGabaritos = async () => {
      try {
        setCarregando(true);
        const gabaritosDoBanco = await gabaritosService.listarTodos();

        // Transformar os dados para o formato esperado pelo componente ConsultarGabaritos
        const gabaritosFormatados: GabaritoMock[] = gabaritosDoBanco.map(item => ({
          id: item.id,
          avaliacao: `Avaliação ID: ${item.avaliacaoId}`, // Substituir por descrição real se disponível
          data: new Date().toLocaleDateString(), // Usar data real se disponível
          questoes: item.itens.length // Apenas o número de questões
        }));

        setGabaritosDB(gabaritosFormatados);
      } catch (error) {
        console.error('Erro ao buscar gabaritos:', error);
      } finally {
        setCarregando(false);
      }
    };

    buscarGabaritos();
  }, []);

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
            {carregando ? (
              <div>Carregando gabaritos...</div>
            ) : (
              <ConsultarGabaritos gabaritos={gabaritosDB} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Gabaritos;