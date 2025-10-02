// Script para verificar o administrador
const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function verificarAdmin() {
    try {
        // Buscar o usuário admin
        console.log('Buscando admin...');
        const result = await db.query(
            'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1',
            ['admin@academia.com']
        );

        if (result.rows.length > 0) {
            console.log('Usuário encontrado:', result.rows[0].nome);

            // Verificar se a senha está correta
            try {
                const senhaCorreta = await bcrypt.compare('admin123', result.rows[0].senha_hash);
                console.log('A senha "admin123" está correta?', senhaCorreta);

                // Se a senha estiver incorreta, criar uma nova
                if (!senhaCorreta) {
                    console.log('Vamos criar uma nova senha hash para "admin123"');
                    const salt = await bcrypt.genSalt(10);
                    const novaSenhaHash = await bcrypt.hash('admin123', salt);
                    console.log('Nova senha hash:', novaSenhaHash);

                    // Atualizar a senha no banco de dados
                    console.log('Atualizando senha no banco de dados...');
                    await db.query(
                        'UPDATE usuarios SET senha_hash = $1 WHERE email = $2',
                        [novaSenhaHash, 'admin@academia.com']
                    );
                    console.log('Senha atualizada com sucesso!');
                }
            } catch (bcryptError) {
                console.error('Erro ao verificar senha:', bcryptError);
            }
        } else {
            console.log('Usuário admin não encontrado. Vamos criar um:');
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash('admin123', salt);
            
            const novoAdmin = await db.query(
                'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, cargo',
                ['Administrador', 'admin@academia.com', senhaHash, 'administrador']
            );
            
            console.log('Administrador criado:', novoAdmin.rows[0]);
        }
    } catch (err) {
        console.error('Erro ao verificar admin:', err);
    } finally {
        process.exit(0);
    }
}

verificarAdmin();