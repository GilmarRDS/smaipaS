import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { escolasService } from '@/services/escolasService';
import { turmasService } from '@/services/turmasService';
import { avaliacoesService } from '@/services/avaliacoesService';
import useAuth from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface FilterControlsProps {
  onFilterChange: (filterType: string, value: string) => void;
  selectedFilters: {
    escola: string;
    turma: string;
    turno: string;
    componente: string;
    avaliacao: string;
  };
}

const FilterControls: React.FC<FilterControlsProps> = ({ onFilterChange, selectedFilters }) => {
  const { user, isSecretaria } = useAuth();
  const [escolas, setEscolas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);
        
        // Carregar escolas
        const escolasData = await escolasService.listar();
        if (Array.isArray(escolasData)) {
          setEscolas(escolasData);
        } else {
          console.error('Dados de escolas inválidos:', escolasData);
          setEscolas([]);
        }
        
        // Carregar turmas
        let turmasData = [];
        if (isSecretaria) {
          // Para secretaria, listar todas as turmas se uma escola estiver selecionada
          if (selectedFilters.escola && selectedFilters.escola !== 'all_escolas') {
            turmasData = await turmasService.listar(selectedFilters.escola);
          }
        } else if (user?.schoolId) {
          // Para usuários da escola, listar apenas turmas da própria escola
          turmasData = await turmasService.listar(user.schoolId);
        }
        setTurmas(turmasData);
        
        // Carregar avaliações
        let avaliacoesData = [];
        if (selectedFilters.escola && selectedFilters.escola !== 'all_escolas') {
          if (selectedFilters.turma && selectedFilters.turma !== 'all_turmas') {
            // Se uma turma específica está selecionada, carregar avaliações daquela turma
            avaliacoesData = await avaliacoesService.listarPorTurma(selectedFilters.turma);
          } else {
            // Se não, carregar todas as avaliações da escola
            avaliacoesData = await avaliacoesService.listarPorEscola(selectedFilters.escola);
          }
        }
        setAvaliacoes(avaliacoesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setEscolas([]);
        setTurmas([]);
        setAvaliacoes([]);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [user, isSecretaria, selectedFilters.escola, selectedFilters.turma]);

  // Get unique turnos from turmas
  const turnos = Array.isArray(turmas) ? [...new Set(turmas.map(turma => turma.turno))] : [];
  
  // Get filtered turmas based on selected escola
  const filteredTurmas = Array.isArray(turmas) && selectedFilters.escola !== "all_escolas" 
    ? turmas.filter(turma => turma.escolaId === selectedFilters.escola)
    : turmas || [];

  // Filter avaliacoes based on selected componente and turma
  const filteredAvaliacoes = Array.isArray(avaliacoes)
    ? avaliacoes.filter(avaliacao => {
        if (!avaliacao) return false;
        
        // Se não houver componente selecionado, mostrar todas as avaliações
        if (selectedFilters.componente === 'all_componentes') {
          return true;
        }
        
        // Verificar se avaliacao.disciplina existe e é uma string
        if (typeof avaliacao.disciplina !== 'string') {
          console.warn('Disciplina inválida:', avaliacao.disciplina);
          return false;
        }
        
        // Filtrar pelo componente selecionado
        return avaliacao.disciplina.toLowerCase() === selectedFilters.componente.toLowerCase();
      })
    : [];

  const handleSelectChange = (filterType: string, value: string) => {
    onFilterChange(filterType, value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="escola-filter">Escola</Label>
        <Select 
          value={selectedFilters.escola}
          onValueChange={(value) => handleSelectChange('escola', value)}
        >
          <SelectTrigger id="escola-filter">
            <SelectValue placeholder="Todas as escolas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_escolas">Todas as escolas</SelectItem>
            {escolas.map((escola) => (
              <SelectItem key={escola.id} value={escola.id}>
                {escola.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="turma-filter">Turma</Label>
        <Select 
          value={selectedFilters.turma}
          onValueChange={(value) => handleSelectChange('turma', value)}
        >
          <SelectTrigger id="turma-filter">
            <SelectValue placeholder="Todas as turmas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_turmas">Todas as turmas</SelectItem>
            {filteredTurmas.map((turma) => (
              <SelectItem key={turma.id} value={turma.id}>
                {turma.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="turno-filter">Turno</Label>
        <Select 
          value={selectedFilters.turno}
          onValueChange={(value) => handleSelectChange('turno', value)}
        >
          <SelectTrigger id="turno-filter">
            <SelectValue placeholder="Todos os turnos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_turnos">Todos os turnos</SelectItem>
            {turnos.map((turno) => (
              <SelectItem key={turno} value={turno}>
                {turno.charAt(0).toUpperCase() + turno.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="componente-filter">Componente</Label>
        <Select 
          value={selectedFilters.componente}
          onValueChange={(value) => handleSelectChange('componente', value)}
        >
          <SelectTrigger id="componente-filter">
            <SelectValue placeholder="Todos os componentes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_componentes">Todos os componentes</SelectItem>
            <SelectItem value="portugues">Português</SelectItem>
            <SelectItem value="matematica">Matemática</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avaliacao-filter">Avaliação</Label>
        <Select 
          value={selectedFilters.avaliacao}
          onValueChange={(value) => handleSelectChange('avaliacao', value)}
        >
          <SelectTrigger id="avaliacao-filter">
            <SelectValue placeholder="Todas as avaliações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_avaliacoes">Todas as avaliações</SelectItem>
            {filteredAvaliacoes.map((avaliacao) => (
              <SelectItem key={avaliacao.id} value={avaliacao.id}>
                {avaliacao.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterControls;