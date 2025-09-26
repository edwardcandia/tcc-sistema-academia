// backend/src/middleware/authorizeRole.js

// Este middleware recebe uma lista de cargos permitidos
const authorizeRole = (cargosPermitidos) => {
  return (req, res, next) => {
    // req.user é adicionado pelo middleware anterior, o verifyToken
    const { cargo } = req.user;

    if (cargosPermitidos.includes(cargo)) {
      next(); // O cargo do usuário está na lista, então ele pode prosseguir
    } else {
      res.status(403).json({ error: 'Acesso proibido. Você não tem permissão para este recurso.' });
    }
  };
};

module.exports = authorizeRole;