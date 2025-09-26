// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Importar e usar as rotas
const planosRoutes = require('./src/routes/planosRoutes');
const alunosRoutes = require('./src/routes/alunosRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const pagamentosRoutes = require('./src/routes/pagamentosRoutes');
const authRoutes = require('./src/routes/authRoutes');
const relatoriosRoutes = require('./src/routes/relatoriosRoutes');

app.use('/api', authRoutes);
app.use('/api', planosRoutes);
app.use('/api', alunosRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', pagamentosRoutes);
app.use('/api', relatoriosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});