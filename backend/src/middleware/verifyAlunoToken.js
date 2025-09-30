const jwt = require('jsonwebtoken');
const verifyAlunoToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) { return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' }); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt');
    if (decoded.tipo !== 'aluno') { return res.status(403).json({ error: 'Acesso proibido. Rota exclusiva para alunos.' }); }
    req.aluno = decoded;
    next();
  } catch (error) { res.status(400).json({ error: 'Token inválido.' }); }
};
module.exports = verifyAlunoToken;