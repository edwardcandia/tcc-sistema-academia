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

async function resetPasswords() {
    const novaSenha = 'admin123';
    const hash = await bcrypt.hash(novaSenha, 10);

    const emails = ['admin@academia.com', 'admin@plankgym.com'];
    for (const email of emails) {
        const r = await pool.query(
            'UPDATE usuarios SET senha_hash = $1 WHERE email = $2 RETURNING id, email, cargo',
            [hash, email]
        );
        if (r.rows.length > 0) {
            console.log(`✓ Senha redefinida: ${r.rows[0].email} (${r.rows[0].cargo})`);
        } else {
            console.log(`  Não encontrado: ${email}`);
        }
    }
    await pool.end();
    console.log('\nTodos os admins agora usam senha: admin123');
}

resetPasswords().catch(e => { console.error(e.message); pool.end(); });
