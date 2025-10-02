// backend/test_endpoints.js
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let token = '';

// Login do aluno
async function loginAluno() {
    try {
        console.log('🔑 Fazendo login como aluno...');
        console.log('URL:', `${API_URL}/login`);
        console.log('Payload:', JSON.stringify({
            email: 'lifee.mari@gmail.com',
            senha: '123456'
        }));
        
        const response = await axios.post(`${API_URL}/login`, {
            email: 'lifee.mari@gmail.com',
            senha: '123456'
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

// Testar endpoint histórico de treinos
async function testHistoricoTreinos() {
    try {
        console.log('\n🔍 Testando endpoint GET /registro-treino/historico...');
        const response = await axios.get(`${API_URL}/registro-treino/historico`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao obter histórico:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Testar endpoint notificações
async function testNotificacoes() {
    try {
        console.log('\n🔔 Testando endpoint GET /notificacoes...');
        const response = await axios.get(`${API_URL}/notificacoes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao obter notificações:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Testar endpoint modelos de treino
async function testModelosTreino() {
    try {
        console.log('\n💪 Testando endpoint GET /alunos/8/modelos-treino...');
        const response = await axios.get(`${API_URL}/alunos/8/modelos-treino`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Resposta:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao obter modelos de treino:', error.response ? error.response.data : error.message);
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
        console.log('🚀 Iniciando testes dos endpoints da API...\n');
        
        await loginAluno();
        await testHistoricoTreinos();
        await testNotificacoes();
        await testModelosTreino();
        
        console.log('\n✨ Testes concluídos!');
    } catch (error) {
        console.error('\n❌ Erro ao executar testes:', error.message);
    }
}

runTests();