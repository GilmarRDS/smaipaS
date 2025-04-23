export interface Descritor {
  id: string;
  codigo: string;
  descricao: string;
  disciplina: 'PORTUGUES' | 'MATEMATICA';
  tipo: 'DIAGNOSTICA_INICIAL' | 'DIAGNOSTICA_FINAL'; // ✅ corrigido aqui
  dataCriacao: string;
  dataAtualizacao: string;
}
