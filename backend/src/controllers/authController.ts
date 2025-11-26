// backend/src/controllers/authController.js
import db from "../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken, JWT_CONFIG  } from "../middleware/auth";
import { Request, Response } from 'express';

// Função para verificar a validade de um token (controller - resposta simples)
const verifyToken = (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ valid: false, message: 'Token não fornecido.' });
    }

    // O token vem no formato "Bearer [token]"
    const token = authHeader.split(' ')[1] || authHeader;
    if (!token) {
      return res.json({ valid: false, message: 'Formato de token inválido.' });
    }

    // Verificar o token (não logar token por segurança)
    const decoded: any = jwt.verify(token, JWT_CONFIG.secret);
    
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
    console.error('Erro ao verificar token: ', error && error.message ? error.message : error);
    return res.json({ valid: false, message: 'Token inválido ou expirado.' });
  }
};

const registerUser = async (req: Request, res: Response) => {
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
const login = async (req: Request, res: Response) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        console.log('Tentativa de login para:', email);
        
        // 1. Tenta encontrar o email na tabela de USUÁRIOS (admin/atendente)
        let result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            // Encontrou um usuário do sistema
            const user = result.rows[0];
            const isMatch = await bcrypt.compare(senha, user.senha_hash);
            if (!isMatch) {
                console.log('Senha incorreta para usuário:', email);
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            const tokenPayload = { id: user.id, cargo: user.cargo, tipo: 'user' };
            console.log('Gerando token para usuário com payload:', tokenPayload);
            
            const token = generateToken(tokenPayload);
            return res.json({
              token,
              user: { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo },
            });
        }

                // Student login functionality removed

        // 3. Se não encontrou em nenhuma tabela, retorna erro
        console.log('Usuário não encontrado:', email);
        return res.status(404).json({ error: 'Credenciais inválidas.' });

    } catch (error) {
      console.error("Erro no login unificado:", error && error.message ? error.message : error);
      res.status(500).json({ error: 'Erro no servidor durante o login.' });
    }
};

  export default {
    registerUser,
    login,
    verifyToken
  };