import jwt from "jsonwebtoken";
import { ApiError, ErrorTypes } from "../utils/errorHandler";
import { Request, Response, NextFunction } from 'express';

export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'seu_segredo_jwt',
    options: { expiresIn: '8h' } as jwt.SignOptions
};

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET nao definido em producao.');
}

export const generateToken = (payload: object): string =>
    jwt.sign(payload, JWT_CONFIG.secret, JWT_CONFIG.options);

const extractBearerToken = (authHeader: string | undefined): string => {
    if (!authHeader) {
        throw new ApiError(ErrorTypes.UNAUTHORIZED.code, 'Token nao fornecido.');
    }
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
};

export const verifyRequestToken = (req: Request): any => {
    const token = extractBearerToken(req.headers.authorization);
    try {
        return jwt.verify(token, JWT_CONFIG.secret);
    } catch (err: any) {
        const message = err.name === 'TokenExpiredError'
            ? 'Token expirado. Faca login novamente.'
            : 'Token invalido.';
        throw new ApiError(ErrorTypes.UNAUTHORIZED.code, message);
    }
};

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const decoded: any = verifyRequestToken(req);
        if (decoded.tipo !== 'user') {
            throw new ApiError(ErrorTypes.FORBIDDEN.code, 'Acesso exclusivo para funcionarios.');
        }
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

export const authorizeRoles = (allowedRoles: string[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user?.cargo || !allowedRoles.includes(req.user.cargo)) {
                throw new ApiError(ErrorTypes.FORBIDDEN.code, 'Permissao insuficiente para esta operacao.');
            }
            next();
        } catch (error) {
            next(error);
        }
    };