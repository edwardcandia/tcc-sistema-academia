// backend/src/middleware/auth.js
import jwt from "jsonwebtoken";
import { ApiError, ErrorTypes  } from "../utils/errorHandler";
import { Request, Response, NextFunction } from 'express';

/**
 * Configuration for JWT tokens
 */
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'seu_segredo_jwt',
  options: {
    expiresIn: '8h'
  }
};

// In production, require the JWT_SECRET to be set
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET não definido em ambiente de produção. Abortando.');
  throw new Error('JWT_SECRET não definido');
}

/**
 * Generate JWT token for user
 * @param {Object} payload - The payload to include in the token
 * @returns {string} - JWT token
 */
const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_CONFIG.secret, JWT_CONFIG.options as jwt.SignOptions);
};

/**
 * Verify JWT token from request headers
 * @param {Object} req - Express request object
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (req: Request) => {
  // Extract token from headers
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new ApiError(
      ErrorTypes.UNAUTHORIZED.code,
      'Acesso negado. Nenhum token fornecido.'
    );
  }

  // Parse token
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as any;
    return decoded;
  } catch (error) {
    const err: any = error;
    if (err && err.name === 'JsonWebTokenError') {
      throw new ApiError(
        ErrorTypes.UNAUTHORIZED.code,
        'Token inválido.'
      );
    } else if (err && err.name === 'TokenExpiredError') {
      throw new ApiError(
        ErrorTypes.UNAUTHORIZED.code,
        'Token expirado. Por favor, faça login novamente.'
      );
    }
    throw new ApiError(
      ErrorTypes.UNAUTHORIZED.code,
      'Erro na verificação do token.'
    );
  }
};

/**
 * Middleware to authenticate user (staff or admin)
 */
const authenticateUser = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const decoded = verifyToken(req);
    
    // Check if token is for a user
    if (!decoded.tipo || decoded.tipo !== 'user') {
      throw new ApiError(
        ErrorTypes.FORBIDDEN.code,
        'Acesso proibido. Rota exclusiva para funcionários.'
      );
    }
    
    // Set user info in request
    req.user = decoded;
    (req as any).userId = (decoded as any).id;
    
    next();
  } catch (error) {
    next(error);
  }
};

// Removed authenticateStudent middleware - student portal disabled

/**
 * Middleware to authorize specific roles
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.cargo) {
        throw new ApiError(
          ErrorTypes.FORBIDDEN.code,
          'Acesso negado. Permissões insuficientes.'
        );
      }
      
      if (!allowedRoles.includes(req.user.cargo)) {
        throw new ApiError(
          ErrorTypes.FORBIDDEN.code,
          'Acesso negado. Seu cargo não tem permissão para esta operação.'
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

export {
  generateToken,
  authenticateUser,
  authorizeRoles,
  JWT_CONFIG
};