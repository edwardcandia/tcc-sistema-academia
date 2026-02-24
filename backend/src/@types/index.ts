// src/@types/express/index.d.ts
import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        nome: string;
        cargo?: string;
      };
      aluno?: {
        id: number;
        tipo: string;
      };
    }
  }
}

// Models for our application

export interface User {
  id: number;
  email: string;
  nome: string;
  senha: string;
  cargo: string;
  ativo: boolean;
  data_criacao: Date;
}

export interface Aluno {
  id: number;
  nome_completo: string;
  email: string;
  senha?: string;
  cpf?: string;
  data_nascimento?: Date;
  telefone?: string;
  endereco?: string;
  observacoes?: string;
  status: 'ativo' | 'inativo' | 'pendente';
  plano_id?: number;
  data_inicio?: Date;
  data_fim?: Date;
  data_ultimo_pagamento?: Date;
  valor_mensalidade?: number;
  data_criacao: Date;
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
  data_criacao: Date;
}

export interface Pagamento {
  id: number;
  aluno_id: number;
  valor: number;
  data_pagamento: Date;
  metodo_pagamento: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  referencia: string;
  observacoes?: string;
  data_criacao: Date;
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
  data_criacao: Date;
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
  data_criacao: Date;
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
  data_treino: Date;
  duracao_minutos?: number;
  avaliacao?: number;
  observacoes?: string;
  completo: boolean;
  data_criacao: Date;
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
  tipo: 'geral' | 'treino' | 'instalacoes' | 'atendimento';
  avaliacao: number;
  comentario?: string;
  data_criacao: Date;
  respondido: boolean;
  data_resposta?: Date;
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
  data_criacao: Date;
  data_leitura?: Date;
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
  data_criacao: Date;
}

export interface TermoMatriculaModelo {
  id: number;
  nome: string;
  descricao?: string;
  conteudo: string;
  ativo: boolean;
  data_criacao: Date;
  criado_por?: number;
  ultima_atualizacao: Date;
}

export interface AlunoTermoMatricula {
  id: number;
  aluno_id: number;
  modelo_id?: number;
  nome_arquivo: string;
  caminho_arquivo: string;
  arquivo_nome?: string;
  arquivo_path?: string;
  tipo_arquivo: string;
  tamanho_arquivo: number;
  data_upload: Date;
  tipo_documento: string;
  assinado: boolean;
  data_assinatura?: Date;
  observacoes?: string;
  modelo_nome?: string;
}

export interface DecodedToken {
  id: number;
  email: string;
  nome: string;
  cargo?: string;
  tipo?: string;
  iat?: number;
  exp?: number;
}

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}