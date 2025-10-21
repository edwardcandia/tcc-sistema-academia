// src/types/index.ts

export interface User {
  id: number;
  email: string;
  nome: string;
  cargo?: string;
}

export interface Aluno {
  id: number;
  nome_completo: string;
  email: string;
  cpf?: string;
  data_nascimento?: string;
  telefone?: string;
  endereco?: string;
  observacoes?: string;
  status: 'ativo' | 'inativo' | 'pendente';
  plano_id?: number;
  plano_nome?: string;
  data_inicio?: string;
  data_fim?: string;
  data_ultimo_pagamento?: string;
  valor_mensalidade?: number;
  data_criacao: string;
}

export interface Plano {
  id: number;
  nome: string;
  descricao?: string;
  valor_mensal: number;
  duracao_meses: number;
  taxa_adesao?: number;
  ativo: boolean;
  recursos: string[];
  data_criacao: string;
}

export interface Pagamento {
  id: number;
  aluno_id: number;
  aluno_nome?: string;
  valor: number;
  data_pagamento: string;
  metodo_pagamento: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  referencia: string;
  observacoes?: string;
  data_criacao: string;
}

export interface Exercicio {
  id: number;
  nome: string;
  descricao?: string;
  grupo_muscular: string;
  instrucoes?: string;
  equipamento?: string;
  imagem_url?: string;
  video_url?: string;
  nivel_dificuldade?: 'iniciante' | 'intermediario' | 'avancado';
  ativo: boolean;
  data_criacao: string;
}

export interface ModeloTreino {
  id: number;
  nome: string;
  descricao?: string;
  objetivo: string;
  nivel_dificuldade: 'iniciante' | 'intermediario' | 'avancado';
  duracao_estimada?: number;
  tipo: string;
  ativo: boolean;
  data_criacao: string;
  exercicios?: ExercicioModeloTreino[];
}

export interface ExercicioModeloTreino {
  id: number;
  modelo_treino_id: number;
  exercicio_id: number;
  ordem: number;
  series: number;
  repeticoes: string;
  descanso_segundos?: number;
  observacoes?: string;
  exercicio?: Exercicio;
}

export interface RegistroTreino {
  id: number;
  aluno_id: number;
  modelo_treino_id?: number;
  modelo_nome?: string;
  data_treino: string;
  duracao_minutos?: number;
  avaliacao?: number;
  observacoes?: string;
  completo: boolean;
  data_criacao: string;
  exercicios?: RegistroExercicio[];
}

export interface RegistroExercicio {
  id: number;
  registro_treino_id: number;
  exercicio_id: number;
  series_realizadas: number;
  repeticoes_realizadas: string;
  peso_kg?: string;
  observacoes?: string;
  exercicio?: Exercicio;
}

export interface Feedback {
  id: number;
  aluno_id: number;
  aluno_nome?: string;
  tipo: 'geral' | 'treino' | 'instalacoes' | 'atendimento';
  avaliacao: number;
  comentario?: string;
  data_criacao: string;
  respondido: boolean;
  data_resposta?: string;
  resposta?: string;
}

export interface Notificacao {
  id: number;
  usuario_id?: number;
  aluno_id?: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  data_criacao: string;
  data_leitura?: string;
  link?: string;
}

export interface NotificacaoAutomatica {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  ativo: boolean;
  gatilho: 'aniversario' | 'pagamento_pendente' | 'sem_treino' | 'treino_completo' | 'contrato_vencendo';
  dias_antecedencia?: number;
  data_criacao: string;
}

export interface TermoMatriculaModelo {
  id: number;
  nome: string;
  descricao?: string;
  conteudo: string;
  ativo: boolean;
  data_criacao: string;
  criado_por?: number;
  ultima_atualizacao: string;
}

export interface AlunoTermoMatricula {
  id: number;
  aluno_id: number;
  modelo_id?: number;
  nome_arquivo: string;
  caminho_arquivo: string;
  tipo_arquivo: string;
  tamanho_arquivo: number;
  data_upload: string;
  tipo_documento: string;
  assinado: boolean;
  data_assinatura?: string;
  observacoes?: string;
  modelo_nome?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
  meta?: {
    totalCount?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}