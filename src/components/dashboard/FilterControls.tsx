
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ESCOLAS_MOCK } from "@/types/escolas";
import { TURMAS_MOCK, ANOS_ESCOLARES } from "@/types/turmas";
import { AVALIACOES_MOCK } from "@/types/avaliacoes";

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
  // Get unique turnos from turmas
  const turnos = [...new Set(TURMAS_MOCK.map(turma => turma.turno))];
  // Get filtered turmas based on selected escola
  const filteredTurmas = selectedFilters.escola 
    ? TURMAS_MOCK.filter(turma => turma.escolaId === selectedFilters.escola)
    : TURMAS_MOCK;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="escola-filter">Escola</Label>
        <Select 
          value={selectedFilters.escola}
          onValueChange={(value) => onFilterChange('escola', value)}
        >
          <SelectTrigger id="escola-filter">
            <SelectValue placeholder="Todas as escolas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as escolas</SelectItem>
            {ESCOLAS_MOCK.map((escola) => (
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
          onValueChange={(value) => onFilterChange('turma', value)}
        >
          <SelectTrigger id="turma-filter">
            <SelectValue placeholder="Todas as turmas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as turmas</SelectItem>
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
          onValueChange={(value) => onFilterChange('turno', value)}
        >
          <SelectTrigger id="turno-filter">
            <SelectValue placeholder="Todos os turnos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os turnos</SelectItem>
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
          onValueChange={(value) => onFilterChange('componente', value)}
        >
          <SelectTrigger id="componente-filter">
            <SelectValue placeholder="Todos os componentes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os componentes</SelectItem>
            <SelectItem value="portugues">Língua Portuguesa</SelectItem>
            <SelectItem value="matematica">Matemática</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avaliacao-filter">Avaliação</Label>
        <Select 
          value={selectedFilters.avaliacao}
          onValueChange={(value) => onFilterChange('avaliacao', value)}
        >
          <SelectTrigger id="avaliacao-filter">
            <SelectValue placeholder="Todas as avaliações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as avaliações</SelectItem>
            {AVALIACOES_MOCK.map((avaliacao) => (
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
