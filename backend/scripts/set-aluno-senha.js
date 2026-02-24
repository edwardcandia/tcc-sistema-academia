require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function run() {
    const hash = await bcrypt.hash('aluno123', 10);
    const r = await pool.query(
        'UPDATE alunos SET senha_hash = $1 WHERE id = (SELECT id FROM alunos ORDER BY id LIMIT 1) RETURNING id, nome_completo, email',
        [hash]
    );
    if (r.rows.length > 0) {
        console.log('Senha definida para:', r.rows[0]);
        console.log('Login: ' + r.rows[0].email + ' / aluno123');
    } else {
        console.log('Nenhum aluno encontrado no banco.');
    }
    await pool.end();
}

run().catch(e => { console.error(e.message); pool.end(); });
