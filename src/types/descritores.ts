export interface Descritor {
  id: string;
  codigo: string;
  descricao: string;
  disciplina: 'PORTUGUES' | 'MATEMATICA';
  tipo: 'DIAGNOSTICA_INICIAL' | 'DIAGNOSTICA_FINAL'; // ✅ corrigido aqui
  ano: string; // Ano/série do descritor (ex: "1º ano", "2º ano", etc)
  dataCriacao: string;
  dataAtualizacao: string;
}
