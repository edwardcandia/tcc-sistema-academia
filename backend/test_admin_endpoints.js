// backend/test_admin_endpoints.js
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let token = '';

// Login como administrador
async function loginAdmin() {
    try {
        console.log('🔑 Fazendo login como administrador...');
        console.log('URL:', `${API_URL}/login`);
        console.log('Payload:', JSON.stringify({
            email: 'admin@academia.com',
            senha: 'admin123'
        }));
        
        const response = await axios.post(`${API_URL}/login`, {
            email: 'admin@academia.com',
            senha: 'admin123'
        });
        
        token = response.data.token;
        console.log('✅ Login bem-sucedido! Token: ', token.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('❌ Erro no login:', error);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('Requisição enviada, mas sem resposta:', error.request);
        } else {
            console.error('Erro na configuração da requisição:', error.message);
        }
        throw error;
    }
}

// Testar endpoint listar alunos
async function testListarAlunos() {
    try {
        console.log('\n👥 Testando endpoint GET /alunos...');
        const response = await axios.get(`${API_URL}/alunos`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao listar alunos:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Testar endpoint listar aulas
async function testListarAulas() {
    try {
        console.log('\n📅 Testando endpoint GET /aulas...');
        const response = await axios.get(`${API_URL}/aulas`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao listar aulas:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Testar endpoint listar modelos de treino
async function testListarModelosTreino() {
    try {
        console.log('\n💪 Testando endpoint GET /modelos-treino...');
        const response = await axios.get(`${API_URL}/modelos-treino`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao listar modelos de treino:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Testar endpoint listar registros de treino de um aluno
async function testListarRegistrosTreino() {
    try {
        // Primeiro vamos obter um aluno para usar no teste
        const alunosResponse = await axios.get(`${API_URL}/alunos`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (alunosResponse.data.length === 0) {
            console.log('❓ Nenhum aluno encontrado para testar registro de treino');
            return null;
        }
        
        const alunoId = alunosResponse.data[0].id;
        
        console.log('\n📝 Testando endpoint GET /registro-treino/aluno/' + alunoId);
        const response = await axios.get(`${API_URL}/registro-treino/aluno/${alunoId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao listar registros de treino:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Executar os testes
async function runTests() {
    try {
        console.log('🚀 Iniciando testes de administrador dos endpoints da API...\n');
        
        await loginAdmin();
        await testListarAlunos();
        await testListarAulas();
        await testListarModelosTreino();
        await testListarRegistrosTreino();
        
        console.log('\n✨ Testes concluídos!');
    } catch (error) {
        console.error('\n❌ Erro ao executar testes:', error.message);
    }
}

runTests();