// backend/src/routes/authRoutes.ts
import express from "express";
import authController from "../controllers/authController";
import { authenticateUser, authorizeRoles } from "../middleware/auth";
import db from "../config/database";
import bcrypt from "bcryptjs";

const router = express.Router();

// Registrar novo usuário admin/atendente
router.post('/auth/register', authController.registerUser);

// Verificar se o token é válido
router.get('/auth/verify-token', authController.verifyToken);

// Rota unificada de login
router.post('/login', authController.login);

// Rotas de setup - protegidas, apenas administradores
router.get('/setup/add-senha-hash', authenticateUser, authorizeRoles(['administrador']), async (req, res) => {
    try {
        const columnCheck = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='alunos' AND column_name='senha_hash'
        `);
        if (columnCheck.rows.length === 0) {
            await db.query(`ALTER TABLE alunos ADD COLUMN senha_hash VARCHAR(255)`);
            res.json({ success: true, message: 'Coluna senha_hash adicionada com sucesso' });
        } else {
            res.json({ success: true, message: 'Coluna senha_hash já existe' });
        }
    } catch (error) {
        console.error('Erro ao adicionar coluna senha_hash:', error);
        res.status(500).json({ error: 'Erro ao modificar tabela alunos' });
    }
});

router.post('/setup/set-aluno-senha', authenticateUser, authorizeRoles(['administrador']), async (req, res) => {
    const { alunoId, senha } = req.body;
    if (!alunoId || !senha) {
        return res.status(400).json({ error: 'ID do aluno e senha são obrigatórios' });
    }
    try {
        const alunoCheck = await db.query('SELECT id FROM alunos WHERE id = $1', [alunoId]);
        if (alunoCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        await db.query('UPDATE alunos SET senha_hash = $1 WHERE id = $2', [senhaHash, alunoId]);
        res.json({ success: true, message: 'Senha do aluno definida com sucesso' });
    } catch (error) {
        console.error('Erro ao definir senha do aluno:', error);
        res.status(500).json({ error: 'Erro ao atualizar senha do aluno' });
    }
});

export default router;