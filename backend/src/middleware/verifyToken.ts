import jwt from "jsonwebtoken";
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) { return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' }); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt');
    req.user = decoded;
    next();
  } catch (error) { res.status(400).json({ error: 'Token inválido.' }); }
};
export default verifyToken;