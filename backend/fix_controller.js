const fs = require('fs');
const path = require('path');

// Caminho do arquivo
const filePath = path.join(__dirname, 'src', 'controllers', 'registroTreinoController.js');

// Ler o conteúdo do arquivo
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Erro ao ler o arquivo:', err);
        return;
    }
    
    // Substituir a linha problemática
    const correctedContent = data.replace('});/', '});');
    
    // Adicionar a nova função no final do arquivo
    const newFunction = `
// Obter histórico de treinos realizados por um aluno específico (para admin/atendentes)
exports.obterHistoricoTreinosAluno = async (req, res) => {
    try {
        const { aluno_id } = req.params;
        
        // Verificar se o ID do aluno está definido
        if (!aluno_id) {
            return res.status(400).json({
                success: false,
                message: 'ID do aluno não fornecido na requisição'
            });
        }
        
        // Verificar se o aluno existe
        const alunoCheck = await db.query('SELECT id FROM alunos WHERE id = $1', [aluno_id]);
        if (alunoCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }
        
        // Obter histórico de treinos
        const result = await db.query(\`
            SELECT 
                rt.id,
                rt.data_realizacao,
                rt.duracao,
                rt.observacoes,
                rt.avaliacao,
                rt.created_at,
                mt.nome as nome_treino,
                mt.descricao as descricao_treino
            FROM 
                registros_treino rt
            LEFT JOIN 
                modelos_treino mt ON rt.treino_id = mt.id
            WHERE 
                rt.aluno_id = $1
            ORDER BY 
                rt.data_realizacao DESC
        \`, [aluno_id]);
        
        res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Erro ao obter histórico de treinos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter histórico de treinos',
            error: error.message
        });
    }
};`;

    // Escrever o arquivo corrigido
    fs.writeFile(filePath, correctedContent + newFunction, 'utf8', (err) => {
        if (err) {
            console.error('Erro ao escrever o arquivo:', err);
            return;
        }
        console.log('Arquivo corrigido com sucesso!');
    });
});