const authorizeRole = (cargosPermitidos) => {
  return (req, res, next) => {
    const { cargo } = req.user;
    if (cargosPermitidos.includes(cargo)) {
      next();
    } else {
      res.status(403).json({ error: 'Acesso proibido. Você não tem permissão para este recurso.' });
    }
  };
};
module.exports = authorizeRole;