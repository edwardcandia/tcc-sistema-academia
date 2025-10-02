// backend/test_debug.js
const axios = require('axios');

async function testDebugEndpoint() {
    try {
        console.log('Testing debug server connection...');
        const response = await axios.get('http://localhost:3001/');
        console.log('Response:', response.data);
        
        console.log('\nTesting login endpoint...');
        const loginResponse = await axios.post('http://localhost:3001/api/login', {
            email: 'lifee.mari@gmail.com',
            senha: '123456'
        });
        
        const token = loginResponse.data.token;
        console.log('Login successful! Token:', token.substring(0, 20) + '...');
        
        console.log('\nTesting modelos-treino endpoint...');
        const modelosResponse = await axios.get('http://localhost:3001/api/alunos/8/modelos-treino', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Response:', JSON.stringify(modelosResponse.data, null, 2));
        
        console.log('\nTesting historico endpoint...');
        const historicoResponse = await axios.get('http://localhost:3001/api/registro-treino/historico', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Response:', JSON.stringify(historicoResponse.data, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testDebugEndpoint();