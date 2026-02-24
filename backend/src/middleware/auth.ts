import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorTypes } from '../utils/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt';

// Explode rápido em produção se alguém esqueceu de setar a variável
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET não definido em produção.');
}

export const JWT_CONFIG = {
    secret: JWT_SECRET,
    options: { expiresIn: '8h' } as jwt.SignOptions,
};

export const generateToken = (payload: object): string =>
    jwt.sign(payload, JWT_SECRET, JWT_CONFIG.options);

export const verifyRequestToken = (req: Request): any => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new ApiError(ErrorTypes.UNAUTHORIZED.code, 'Token não fornecido.');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err: any) {
        const msg = err.name === 'TokenExpiredError'
            ? 'Token expirado. Faça login novamente.'
            : 'Token inválido.';
        throw new ApiError(ErrorTypes.UNAUTHORIZED.code, msg);
    }
};

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const decoded: any = verifyRequestToken(req);
        if (decoded.tipo !== 'user') {
            throw new ApiError(ErrorTypes.FORBIDDEN.code, 'Acesso exclusivo para funcionários.');
        }
        req.user = decoded;
        next();
    } catch (err) {
        next(err);
    }
};

export const authorizeRoles = (roles: string[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user?.cargo || !roles.includes(req.user.cargo)) {
            next(new ApiError(ErrorTypes.FORBIDDEN.code, 'Permissão insuficiente para esta operação.'));
            return;
        }
        next();
    };

// Middleware exclusivo para o portal do aluno
export const authenticateAluno = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const decoded: any = verifyRequestToken(req);
        if (decoded.tipo !== 'aluno') {
            throw new ApiError(ErrorTypes.FORBIDDEN.code, 'Acesso exclusivo para alunos.');
        }
        req.aluno = decoded;
        next();
    } catch (err) {
        next(err);
    }
};