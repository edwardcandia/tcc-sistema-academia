import db from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken, JWT_CONFIG } from '../middleware/auth';
import { Request, Response } from 'express';

const verifyToken = (req: Request, res: Response): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.json({ valid: false, message: 'Token não fornecido.' });
        return;
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    try {
        const decoded: any = jwt.verify(token, JWT_CONFIG.secret);
        res.json({ valid: true, user: { id: decoded.id, tipo: decoded.tipo, cargo: decoded.cargo } });
    } catch {
        res.json({ valid: false, message: 'Token invalido ou expirado.' });
    }
};

const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { nome, email, senha, cargo } = req.body;
    if (!nome || !email || !senha || !cargo) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        return;
    }
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const result = await db.query(
            'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, cargo',
            [nome, email, senhaHash, cargo]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ error: 'E-mail já cadastrado.' });
            return;
        }
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        res.status(400).json({ error: 'Email e senha sao obrigatorios.' });
        return;
    }
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
            return;
        }
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(senha, user.senha_hash);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
            return;
        }
        const token = generateToken({ id: user.id, cargo: user.cargo, tipo: 'user' });
        res.json({
            token,
            user: { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro no servidor durante o login.' });
    }
};

export default { registerUser, login, verifyToken };