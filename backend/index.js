// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/database');

db.query('SELECT NOW()')
    .then(res => console.log('--- Conexão com o PostgreSQL bem-sucedida! ---'))
    .catch(err => console.error('!!!!!! FALHA CRÍTICA NA CONEXÃO COM O BANCO DE DADOS !!!!!!', err));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const planosRoutes = require('./src/routes/planosRoutes');
const alunosRoutes = require('./src/routes/alunosRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const pagamentosRoutes = require('./src/routes/pagamentosRoutes');
const authRoutes = require('./src/routes/authRoutes');
const relatoriosRoutes = require('./src/routes/relatoriosRoutes');
const portalRoutes = require('./src/routes/portalRoutes');
const exerciciosRoutes = require('./src/routes/exerciciosRoutes');
const modelosTreinoRoutes = require('./src/routes/modelosTreinoRoutes');

app.use('/api', authRoutes);
app.use('/api', planosRoutes);
app.use('/api', alunosRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', pagamentosRoutes);
app.use('/api', relatoriosRoutes);
app.use('/api', portalRoutes);
app.use('/api', exerciciosRoutes);
app.use('/api', modelosTreinoRoutes);

app.listen(PORT, () => {
  console.log(`--- Servidor rodando na porta ${PORT} ---`);
});