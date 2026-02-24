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
        // 1. Tentar login como funcionário (usuarios)
        const userResult = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
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
            return;
        }

        // 2. Tentar login como aluno (portal do aluno)
        const alunoResult = await db.query(
            'SELECT id, nome_completo, email, senha_hash FROM alunos WHERE email = $1',
            [email]
        );
        if (alunoResult.rows.length > 0) {
            const aluno = alunoResult.rows[0];
            if (!aluno.senha_hash) {
                res.status(401).json({ error: 'Senha não definida para este aluno. Solicite ao administrador.' });
                return;
            }
            const passwordMatch = await bcrypt.compare(senha, aluno.senha_hash);
            if (!passwordMatch) {
                res.status(401).json({ error: 'Credenciais inválidas.' });
                return;
            }
            const token = generateToken({ id: aluno.id, tipo: 'aluno' });
            res.json({
                token,
                aluno: { id: aluno.id, nome: aluno.nome_completo, email: aluno.email }
            });
            return;
        }

        res.status(401).json({ error: 'Credenciais inválidas.' });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro no servidor durante o login.' });
    }
};

const getUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await db.query(
            'SELECT id, nome, email, cargo FROM usuarios ORDER BY cargo, nome'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
};

const deleteUsuario = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // Impede que o admin exclua a si mesmo
    if (req.user?.id === Number(id)) {
        res.status(400).json({ error: 'Você não pode excluir sua própria conta.' });
        return;
    }
    try {
        const result = await db.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING id, nome, email',
            [id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }
        res.json({ message: 'Usuário removido com sucesso.', usuario: result.rows[0] });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
};

const resetSenhaUsuario = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { senha } = req.body;
    if (!senha || senha.length < 6) {
        res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
        return;
    }
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const result = await db.query(
            'UPDATE usuarios SET senha_hash = $1 WHERE id = $2 RETURNING id, nome, email',
            [senhaHash, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }
        res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ error: 'Erro ao redefinir senha.' });
    }
};

export default { registerUser, login, verifyToken, getUsuarios, deleteUsuario, resetSenhaUsuario };