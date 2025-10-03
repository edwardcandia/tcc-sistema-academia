// backend/src/utils/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API PlankGYM',
    version: '1.0.0',
    description: 'Documentação da API do PlankGYM - Sistema de Gestão de Academia',
    license: {
      name: 'MIT',
      url: 'https://spdx.org/licenses/MIT.html',
    },
    contact: {
      name: 'Suporte PlankGYM',
      url: 'https://plankgym.com',
      email: 'suporte@plankgym.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor de desenvolvimento',
    },
    {
      url: 'https://api.plankgym.com',
      description: 'Servidor de produção',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Mensagem de erro',
          },
          details: {
            type: 'object',
            example: null,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
          path: {
            type: 'string',
            example: '/api/endpoint',
          },
        },
      },
      Login: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'usuario@example.com',
          },
          senha: {
            type: 'string',
            format: 'password',
            example: '123456',
          },
        },
      },
      TokenResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                example: 1,
              },
              nome: {
                type: 'string',
                example: 'João Silva',
              },
              email: {
                type: 'string',
                example: 'joao@example.com',
              },
              cargo: {
                type: 'string',
                example: 'administrador',
              },
            },
          },
        },
      },
      RegistroTreino: {
        type: 'object',
        required: ['treino_id', 'data', 'duracao'],
        properties: {
          treino_id: {
            type: 'integer',
            example: 1,
          },
          data: {
            type: 'string',
            format: 'date',
            example: '2025-10-01',
          },
          duracao: {
            type: 'integer',
            example: 45,
          },
          observacoes: {
            type: 'string',
            example: 'Sentindo progresso nos exercícios',
          },
          avaliacao: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            example: 4,
          },
        },
      },
      HistoricoTreino: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          treino_id: {
            type: 'integer',
            example: 2,
          },
          treino_nome: {
            type: 'string',
            example: 'Treino A - Peito e Tríceps',
          },
          data_realizacao: {
            type: 'string',
            format: 'date',
            example: '2025-09-28',
          },
          duracao: {
            type: 'integer',
            example: 45,
          },
          observacoes: {
            type: 'string',
            example: 'Aumentei peso no supino',
          },
          avaliacao: {
            type: 'integer',
            example: 4,
          },
        },
      },
      // Add more schemas as needed
    },
    responses: {
      UnauthorizedError: {
        description: 'Token de autenticação ausente, inválido ou expirado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Sem permissão para acessar este recurso',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      ValidationError: {
        description: 'Erro de validação dos dados enviados',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      ServerError: {
        description: 'Erro interno do servidor',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Autenticação',
      description: 'Operações relacionadas a autenticação',
    },
    {
      name: 'Alunos',
      description: 'Gerenciamento de alunos',
    },
    {
      name: 'Treinos',
      description: 'Gerenciamento de modelos de treino',
    },
    {
      name: 'Registro de Treino',
      description: 'Operações para registrar treinos realizados',
    },
    {
      name: 'Pagamentos',
      description: 'Gerenciamento de pagamentos',
    },
    {
      name: 'Planos',
      description: 'Gerenciamento de planos',
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Setup function for express
const setupSwagger = (app) => {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Sistema Academia - Documentação',
  };

  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Serve swagger spec as JSON
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;