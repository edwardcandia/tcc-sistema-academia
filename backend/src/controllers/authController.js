// backend/src/controllers/authController.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função para verificar a validade de um token
const verifyToken = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ valid: false, message: 'Token não fornecido.' });
    }

    // O token vem no formato "Bearer [token]"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.json({ valid: false, message: 'Formato de token inválido.' });
    }

    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt');
    
    // Token é válido
    return res.json({ 
      valid: true, 
      user: { 
        id: decoded.id, 
        tipo: decoded.tipo,
        cargo: decoded.cargo 
      } 
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.json({ valid: false, message: 'Token inválido ou expirado.' });
  }
};

const registerUser = async (req, res) => {
    // Esta função para registrar admins/atendentes continua a mesma
    const { nome, email, senha, cargo } = req.body;
    if (!nome || !email || !senha || !cargo) { return res.status(400).json({ error: 'Todos os campos são obrigatórios.' }); }
    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const result = await db.query('INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, cargo', [nome, email, senhaHash, cargo]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { return res.status(409).json({ error: 'Email já cadastrado.' }); }
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
};

// --- NOVA FUNÇÃO DE LOGIN INTELIGENTE ---
const login = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        // 1. Tenta encontrar o email na tabela de USUÁRIOS (admin/atendente)
        let result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            // Encontrou um usuário do sistema
            const user = result.rows[0];
            const isMatch = await bcrypt.compare(senha, user.senha_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            const token = jwt.sign({ id: user.id, cargo: user.cargo, tipo: 'user' }, process.env.JWT_SECRET, { expiresIn: '8h' });
            return res.json({
                token,
                user: { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo },
            });
        }

        // 2. Se não encontrou, tenta encontrar na tabela de ALUNOS
        result = await db.query('SELECT * FROM alunos WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            // Encontrou um aluno
            const aluno = result.rows[0];
            if (!aluno.senha_hash) {
                return res.status(401).json({ error: 'Senha de aluno ainda não definida.' });
            }
            const isMatch = await bcrypt.compare(senha, aluno.senha_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            const token = jwt.sign({ id: aluno.id, tipo: 'aluno' }, process.env.JWT_SECRET, { expiresIn: '8h' });
            return res.json({
                token,
                aluno: { id: aluno.id, nome: aluno.nome_completo, email: aluno.email },
            });
        }

        // 3. Se não encontrou em nenhuma tabela, retorna erro
        return res.status(404).json({ error: 'Credenciais inválidas.' });

    } catch (error) {
        console.error("Erro no login unificado:", error);
        res.status(500).json({ error: 'Erro no servidor durante o login.' });
    }
};

module.exports = {
    registerUser,
    login,
    verifyToken
};