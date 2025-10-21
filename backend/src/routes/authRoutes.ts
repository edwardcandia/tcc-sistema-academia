// Criar uma rota temporária para adicionar o campo senha_hash na tabela alunos
// Adicionar ao arquivo backend/src/routes/authRoutes.js

import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import db from "../config/database";
import bcrypt from "bcryptjs";

// Route for registering a new admin/attendant
router.post('/auth/register', authController.registerUser);

// Rota para verificar se o token é válido
router.get('/auth/verify-token', authController.verifyToken);

// Student authentication test route removed

// Unified login route for all user types
router.post('/login', authController.login);

// Rota temporária para adicionar campo senha_hash na tabela alunos
router.get('/setup/add-senha-hash', async (req, res) => {
    try {
        // Verificar se a coluna já existe
        const columnCheck = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='alunos' AND column_name='senha_hash'
        `);
        
        if (columnCheck.rows.length === 0) {
            // Adicionar a coluna senha_hash
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

// Rota temporária para definir senha padrão para um aluno específico
router.post('/setup/set-aluno-senha', async (req, res) => {
    const { alunoId, senha } = req.body;
    
    if (!alunoId || !senha) {
        return res.status(400).json({ error: 'ID do aluno e senha são obrigatórios' });
    }
    
    try {
        // Verificar se o aluno existe
        const alunoCheck = await db.query('SELECT id FROM alunos WHERE id = $1', [alunoId]);
        
        if (alunoCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        
        // Gerar hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        
        // Atualizar a senha do aluno
        await db.query('UPDATE alunos SET senha_hash = $1 WHERE id = $2', [senhaHash, alunoId]);
        
        res.json({ success: true, message: 'Senha do aluno definida com sucesso' });
    } catch (error) {
        console.error('Erro ao definir senha do aluno:', error);
        res.status(500).json({ error: 'Erro ao atualizar senha do aluno' });
    }
});

export default router;