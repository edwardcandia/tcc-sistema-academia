// backend/src/controllers/portalController.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Aluno define sua senha pela primeira vez (ou a reseta)
const definirSenhaAluno = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    const result = await pool.query(
      'UPDATE alunos SET senha_hash = $1 WHERE email = $2 RETURNING id, nome_completo, email',
      [senhaHash, email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado com este email.' });
    }
    res.status(200).json({ message: 'Senha definida com sucesso!', aluno: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao definir a senha.' });
  }
};

// Aluno faz login
const loginAluno = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  try {
    const result = await pool.query('SELECT * FROM alunos WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }
    const aluno = result.rows[0];
    if (!aluno.senha_hash) {
      return res.status(401).json({ error: 'Senha ainda não definida.' });
    }
    const isMatch = await bcrypt.compare(senha, aluno.senha_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }
    const token = jwt.sign(
      { id: aluno.id, tipo: 'aluno' },
      process.env.JWT_SECRET || 'seu_segredo_jwt',
      { expiresIn: '8h' }
    );
    res.json({
      token,
      aluno: { id: aluno.id, nome: aluno.nome_completo, email: aluno.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor durante o login.' });
  }
};

// Busca os dados cadastrais do aluno logado
const getMeusDados = async (req, res) => {
    const alunoId = req.aluno.id;
    try {
        const query = `
            SELECT a.nome_completo, a.email, a.cpf, a.telefone, 
                   TO_CHAR(a.data_nascimento, 'DD/MM/YYYY') as data_nascimento,
                   p.nome as nome_plano,
                   TO_CHAR(a.proximo_vencimento, 'DD/MM/YYYY') as proximo_vencimento
            FROM alunos a
            LEFT JOIN planos p ON a.plano_id = p.id
            WHERE a.id = $1;
        `;
        const result = await pool.query(query, [alunoId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dados do aluno não encontrados.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados do aluno.' });
    }
};

// Busca o histórico de pagamentos do aluno logado
const getMeuHistoricoPagamentos = async (req, res) => {
    const alunoId = req.aluno.id;
    try {
        const result = await pool.query(
            "SELECT id, valor, TO_CHAR(data_pagamento, 'DD/MM/YYYY') as data_pagamento FROM pagamentos WHERE aluno_id = $1 ORDER BY data_pagamento DESC",
            [alunoId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar histórico de pagamentos.' });
    }
};

module.exports = {
  definirSenhaAluno,
  loginAluno,
  getMeusDados,
  getMeuHistoricoPagamentos,
};