const db = require('../config/database');

// Retorna métricas básicas para o dashboard
const getMetrics = async (req, res) => {
  try {
    const [totalAlunosRes, alunosAtivosRes, totalPlanosRes, receitaMensalRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM alunos'),
      db.query("SELECT COUNT(*) FROM alunos WHERE status = 'ativo'"),
      db.query('SELECT COUNT(*) FROM planos'),
      db.query(`SELECT SUM(p.valor) as receita_total FROM alunos a JOIN planos p ON a.plano_id = p.id WHERE a.status = 'ativo'`)
    ]);

    const metrics = {
      totalAlunos: parseInt(totalAlunosRes.rows[0].count, 10),
      alunosAtivos: parseInt(alunosAtivosRes.rows[0].count, 10),
      totalPlanos: parseInt(totalPlanosRes.rows[0].count, 10),
      receitaMensal: parseFloat(receitaMensalRes.rows[0].receita_total || 0).toFixed(2)
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
    res.status(500).json({ error: 'Erro ao buscar as métricas.' });
  }
};

// Retorna aniversariantes do mês atual
const getAniversariantesDoMes = async (req, res) => {
  try {
    const query = `SELECT id, nome_completo, TO_CHAR(data_nascimento, 'DD/MM') as aniversario 
                  FROM alunos 
                  WHERE EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM NOW()) 
                    AND status = 'ativo' 
                  ORDER BY EXTRACT(DAY FROM data_nascimento) ASC;`;
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar aniversariantes:", error);
    res.status(500).json({ error: 'Erro ao buscar aniversariantes.' });
  }
};

// Retorna pagamentos próximos do vencimento (próximos 7 dias)
const getPagamentosVencendo = async (req, res) => {
  try {
    const query = `SELECT id, nome_completo, TO_CHAR(proximo_vencimento, 'DD/MM/YYYY') as vencimento 
                  FROM alunos 
                  WHERE status = 'ativo' 
                    AND proximo_vencimento BETWEEN NOW() AND NOW() + INTERVAL '7 days' 
                  ORDER BY proximo_vencimento ASC;`;
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar pagamentos próximos:", error);
    res.status(500).json({ error: 'Erro ao buscar pagamentos próximos.' });
  }
};

// Retorna estatísticas gerais para o dashboard
const getEstatisticas = async (req, res) => {
  try {
    // Buscar todas as métricas necessárias para o dashboard em uma única requisição
    const [totalAlunosRes, alunosAtivosRes, receitaMesRes, pagamentosPendentesRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM alunos'),
      db.query("SELECT COUNT(*) FROM alunos WHERE status = 'ativo'"),
      db.query(`SELECT SUM(p.valor) as receita_total FROM alunos a JOIN planos p ON a.plano_id = p.id WHERE a.status = 'ativo'`),
      db.query(`SELECT COUNT(*) FROM alunos WHERE status = 'ativo' AND proximo_vencimento < NOW()`)
    ]);

    const estatisticas = {
      totalAlunos: parseInt(totalAlunosRes.rows[0].count, 10),
      alunosAtivos: parseInt(alunosAtivosRes.rows[0].count, 10),
      receitaMes: parseFloat(receitaMesRes.rows[0].receita_total || 0),
      pagamentosPendentes: parseInt(pagamentosPendentesRes.rows[0].count, 10)
    };

    res.status(200).json(estatisticas);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard.' });
  }
};

// Retorna dados para o gráfico de status de alunos
const getStatusAlunos = async (req, res) => {
  try {
    const query = `
      SELECT status, COUNT(*) as total
      FROM alunos
      GROUP BY status
      ORDER BY status;
    `;
    const result = await db.query(query);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar status de alunos:", error);
    res.status(500).json({ error: 'Erro ao buscar dados de status de alunos.' });
  }
};

// Retorna distribuição de alunos por plano
const getDistribuicaoPlanos = async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.nome, COUNT(a.id) as total_alunos
      FROM planos p
      LEFT JOIN alunos a ON p.id = a.plano_id
      GROUP BY p.id, p.nome
      ORDER BY p.nome;
    `;
    const result = await db.query(query);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar distribuição de planos:", error);
    res.status(500).json({ error: 'Erro ao buscar distribuição de alunos por plano.' });
  }
};

// Retorna histórico de pagamentos dos últimos 6 meses
const getHistoricoPagamentos = async (req, res) => {
  try {
    // Simulação - em uma implementação real, você teria uma tabela de pagamentos
    // Aqui vamos gerar dados simulados baseados nos planos e alunos ativos
    
    // Primeiro, pegamos a receita mensal atual
    const receitaMensalRes = await db.query(`
      SELECT SUM(p.valor) as receita_total 
      FROM alunos a 
      JOIN planos p ON a.plano_id = p.id 
      WHERE a.status = 'ativo'
    `);
    
    const receitaBase = parseFloat(receitaMensalRes.rows[0].receita_total || 0);
    
    // Gerar valores para os últimos 6 meses (simulado com variações aleatórias)
    const meses = [];
    const valores = [];
    
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje);
      data.setMonth(hoje.getMonth() - i);
      const mes = data.toLocaleString('pt-BR', { month: 'short' });
      
      // Simular variação na receita (entre -10% e +10% do valor base)
      const variacao = Math.random() * 0.2 - 0.1; // entre -10% e +10%
      const valor = receitaBase * (1 + variacao);
      
      meses.push(mes);
      valores.push(Math.round(valor * 100) / 100); // Arredondar para 2 casas decimais
    }
    
    res.status(200).json({
      meses,
      valores
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de pagamentos:", error);
    res.status(500).json({ error: 'Erro ao buscar histórico de pagamentos.' });
  }
};

module.exports = {
  getMetrics,
  getAniversariantesDoMes,
  getPagamentosVencendo,
  getEstatisticas,
  getStatusAlunos,
  getDistribuicaoPlanos,
  getHistoricoPagamentos
};