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
    try {
        // Busca todos os alunos que não têm senha definida
        const alunosResult = await pool.query(
            'SELECT id, nome_completo, email, cpf FROM alunos WHERE senha_hash IS NULL'
        );
        
        if (alunosResult.rows.length === 0) {
            console.log('✅ Todos os alunos já possuem senha definida.');
            await pool.end();
            return;
        }
        
        console.log(`📋 Encontrados ${alunosResult.rows.length} aluno(s) sem senha. Definindo senhas...`);
        
        let atualizado = 0;
        for (const aluno of alunosResult.rows) {
            // Remove formatação do CPF (apenas números)
            const cpfLimpo = aluno.cpf.replace(/\D/g, '');
            const senhaHash = await bcrypt.hash(cpfLimpo, 10);
            
            await pool.query(
                'UPDATE alunos SET senha_hash = $1 WHERE id = $2',
                [senhaHash, aluno.id]
            );
            
            console.log(`✅ Senha definida para: ${aluno.nome_completo} (${aluno.email})`);
            console.log(`   Login: ${aluno.email} / Senha: ${cpfLimpo}`);
            atualizado++;
        }
        
        console.log(`\n🎉 ${atualizado} aluno(s) atualizado(s) com sucesso!`);
        console.log('💡 Senha padrão: CPF (apenas números, sem pontos e traços)');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar senhas:', error.message);
    } finally {
        await pool.end();
    }
}

run();
