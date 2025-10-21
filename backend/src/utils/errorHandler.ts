// backend/src/utils/errorHandler.js

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational; // Used to determine if it's a trusted error
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error codes and messages
 */
const ErrorTypes = {
  BAD_REQUEST: {
    code: 400,
    message: 'Requisição inválida'
  },
  UNAUTHORIZED: {
    code: 401,
    message: 'Não autorizado'
  },
  FORBIDDEN: {
    code: 403,
    message: 'Acesso proibido'
  },
  NOT_FOUND: {
    code: 404,
    message: 'Recurso não encontrado'
  },
  VALIDATION_ERROR: {
    code: 422,
    message: 'Erro de validação'
  },
  INTERNAL_ERROR: {
    code: 500,
    message: 'Erro interno do servidor'
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    message: 'Serviço indisponível'
  }
};

/**
 * Express middleware for handling errors
 */
const errorMiddleware = (err, req, res, next) => {
  // Log error
  console.error('Error Handler:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // If the error is an ApiError, use its status code and message
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      timestamp: err.timestamp,
      path: req.originalUrl
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      message: 'Conflito de dados. Registro duplicado.',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  // Default is 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  // In production, don't expose error details for 500 errors
  const details = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Erro interno do servidor' 
    : err.details || err.message;

  return res.status(statusCode).json({
    success: false,
    message,
    details,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

/**
 * Async handler to wrap async route handlers
 * Eliminates need for try-catch blocks in controllers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export {
  ApiError,
  ErrorTypes,
  errorMiddleware,
  asyncHandler
};