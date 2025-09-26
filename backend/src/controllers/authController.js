// backend/src/controllers/authController.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função para registrar um novo usuário (ex: um recepcionista)
const registerUser = async (req, res) => {
  const { nome, email, senha, cargo } = req.body;
  if (!nome || !email || !senha || !cargo) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, cargo',
      [nome, email, senhaHash, cargo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

// Função para fazer login
const loginUser = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email and senha são obrigatórios.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(senha, user.senha_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    // Cria o Token JWT
    const token = jwt.sign(
      { id: user.id, cargo: user.cargo },
      process.env.JWT_SECRET || 'seu_segredo_jwt', // Crie JWT_SECRET no seu .env
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo }
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor durante o login.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};