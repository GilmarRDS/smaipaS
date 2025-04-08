
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AVALIACOES_MOCK, Avaliacao } from '@/types/avaliacoes';
import { useAuth } from '@/contexts/AuthContext';
import AvaliacaoForm from '@/components/avaliacoes/AvaliacaoForm';
import AvaliacaoDetails from '@/components/avaliacoes/AvaliacaoDetails';
import AvaliacoesTable from '@/components/avaliacoes/AvaliacoesTable';
import EmptyAvaliacoes from '@/components/avaliacoes/EmptyAvaliacoes';

const Avaliacoes: React.FC = () => {
  const { isSecretaria } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(AVALIACOES_MOCK);
  const [activeTab, setActiveTab] = useState<string>('todas');
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<Avaliacao | null>(null);

  const handleViewDetails = (avaliacao: Avaliacao) => {
    setSelectedAvaliacao(avaliacao);
    setDetailsOpen(true);
  };

  const handleAddAvaliacao = (newAvaliacao: Omit<Avaliacao, 'id'>) => {
    const novaAvaliacao: Avaliacao = {
      id: `aval-${avaliacoes.length + 1}`,
      ...newAvaliacao
    };

    setAvaliacoes([...avaliacoes, novaAvaliacao]);
    toast.success('Avaliação cadastrada com sucesso!');
  };

  const handleStatusChange = (avaliacaoId: string, novoStatus: Avaliacao['status']) => {
    setAvaliacoes(avaliacoes.map(avaliacao => 
      avaliacao.id === avaliacaoId ? { ...avaliacao, status: novoStatus } : avaliacao
    ));
    toast.success(`Status da avaliação atualizado para ${novoStatus === 'em-andamento' ? 'Em andamento' : novoStatus === 'concluida' ? 'Concluída' : novoStatus === 'agendada' ? 'Agendada' : 'Cancelada'}`);
  };

  const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
    if (activeTab === 'todas') return true;
    return avaliacao.status === activeTab;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
            <p className="text-muted-foreground">
              Gerencie as avaliações aplicadas ou a serem aplicadas
            </p>
          </div>
          {isSecretaria && (
            <Button onClick={() => setFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          )}
        </div>

        <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="agendada">Agendadas</TabsTrigger>
            <TabsTrigger value="em-andamento">Em Andamento</TabsTrigger>
            <TabsTrigger value="concluida">Concluídas</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Avaliações {activeTab !== 'todas' 
                    ? (activeTab === 'agendada' 
                      ? 'Agendadas' 
                      : activeTab === 'em-andamento' 
                        ? 'Em Andamento' 
                        : activeTab === 'concluida' 
                          ? 'Concluídas' 
                          : 'Canceladas') 
                    : ''}
                </CardTitle>
                <CardDescription>
                  Gerencie as avaliações e seus respectivos status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredAvaliacoes.length === 0 ? (
                  <EmptyAvaliacoes activeTab={activeTab} />
                ) : (
                  <AvaliacoesTable 
                    avaliacoes={filteredAvaliacoes}
                    onViewDetails={handleViewDetails}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Modal */}
      <AvaliacaoForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        onAddAvaliacao={handleAddAvaliacao} 
      />

      {/* Details Modal */}
      <AvaliacaoDetails 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        avaliacao={selectedAvaliacao} 
      />
    </MainLayout>
  );
};

export default Avaliacoes;
