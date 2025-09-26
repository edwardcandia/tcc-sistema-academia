// backend/src/middleware/verifyToken.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt');
    req.user = decoded; // Adiciona os dados do usuário (id, cargo) na requisição
    next(); // Permite que a requisição continue para a próxima função
  } catch (error) {
    res.status(400).json({ error: 'Token inválido.' });
  }
};

module.exports = verifyToken;