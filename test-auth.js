const axios = require('axios');

const testAuth = async () => {
    const API_URL = 'http://localhost:5000/api/auth';
    const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        phone: '1234567890'
    };

    console.log('🔄 Testing Registration...');
    try {
        const regRes = await axios.post(`${API_URL}/register`, testUser);
        console.log('✅ Registration Successful:', regRes.data);

        console.log('\n🔄 Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ Login Successful:', loginRes.data);

        if (loginRes.data.token) {
            console.log('\n✅ Token Received');
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
};

testAuth();
