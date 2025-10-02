// backend/src/utils/validator.js
const Joi = require('joi');
const { ApiError, ErrorTypes } = require('./errorHandler');

/**
 * Validator middleware factory
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors, not just the first one
      allowUnknown: true, // Ignore unknown props
      stripUnknown: true, // Remove unknown props
    };

    // Extract validatable data
    const data = {};
    if (schema.body) data.body = req.body;
    if (schema.query) data.query = req.query;
    if (schema.params) data.params = req.params;

    // Validate with schema
    const { error, value } = Joi.object(schema).validate(data, validationOptions);

    // If error, format the error response
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new ApiError(
        ErrorTypes.VALIDATION_ERROR.code,
        'Erro de validação dos dados',
        errors
      );
    }

    // Update request with validated data
    if (value.body) req.body = value.body;
    if (value.query) req.query = value.query;
    if (value.params) req.params = value.params;

    next();
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // User ID validation
  id: Joi.object({
    params: Joi.object({
      id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'O ID deve ser um número',
          'number.integer': 'O ID deve ser um número inteiro',
          'number.positive': 'O ID deve ser um número positivo',
          'any.required': 'O ID é obrigatório'
        })
    })
  }),

  // Login validation
  login: Joi.object({
    body: Joi.object({
      email: Joi.string().email().required()
        .messages({
          'string.email': 'E-mail inválido',
          'string.empty': 'E-mail é obrigatório',
          'any.required': 'E-mail é obrigatório'
        }),
      senha: Joi.string().min(6).required()
        .messages({
          'string.min': 'A senha deve ter no mínimo {#limit} caracteres',
          'string.empty': 'Senha é obrigatória',
          'any.required': 'Senha é obrigatória'
        })
    })
  }),

  // Register training schema
  registroTreino: Joi.object({
    body: Joi.object({
      treino_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'ID do treino deve ser um número',
          'number.integer': 'ID do treino deve ser um número inteiro',
          'number.positive': 'ID do treino deve ser um número positivo',
          'any.required': 'ID do treino é obrigatório'
        }),
      data: Joi.date().iso().required()
        .messages({
          'date.base': 'Data inválida',
          'date.format': 'Data deve estar no formato YYYY-MM-DD',
          'any.required': 'Data é obrigatória'
        }),
      duracao: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Duração deve ser um número',
          'number.integer': 'Duração deve ser um número inteiro',
          'number.positive': 'Duração deve ser um número positivo',
          'any.required': 'Duração é obrigatória'
        }),
      observacoes: Joi.string().allow('').max(500)
        .messages({
          'string.max': 'Observações devem ter no máximo {#limit} caracteres'
        }),
      avaliacao: Joi.number().integer().min(1).max(5)
        .messages({
          'number.base': 'Avaliação deve ser um número',
          'number.integer': 'Avaliação deve ser um número inteiro',
          'number.min': 'Avaliação deve ser no mínimo {#limit}',
          'number.max': 'Avaliação deve ser no máximo {#limit}'
        }),
      aluno_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'ID do aluno deve ser um número',
          'number.integer': 'ID do aluno deve ser um número inteiro',
          'number.positive': 'ID do aluno deve ser um número positivo',
          'any.required': 'ID do aluno é obrigatório'
        })
    })
  }),

  // Add more schemas as needed...
};

module.exports = {
  validate,
  schemas
};