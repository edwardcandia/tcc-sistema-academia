/**
 * Script de seed: cria o usuário administrador padrão no banco.
 * Execute apenas uma vez após rodar o schema.sql:
 *   node scripts/seed.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'academia',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function seed() {
    const email = 'admin@plankgym.com';
    const senha = 'admin123';
    const cargo = 'administrador';
    const nome = 'Administrador';

    try {
        const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (existe.rows.length > 0) {
            console.log(`Usuário "${email}" já existe, pulando seed.`);
            return;
        }

        const hash = await bcrypt.hash(senha, 10);
        await pool.query(
            'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES ($1, $2, $3, $4)',
            [nome, email, hash, cargo]
        );

        console.log('✓ Usuário admin criado com sucesso!');
        console.log(`  E-mail: ${email}`);
        console.log(`  Senha:  ${senha}`);
        console.log('\n  ⚠ Troque a senha após o primeiro acesso em produção.');
    } catch (err) {
        console.error('Erro ao executar seed:', err.message);
    } finally {
        await pool.end();
    }
}

seed();
