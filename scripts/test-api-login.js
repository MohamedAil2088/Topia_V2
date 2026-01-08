const axios = require('axios');

const login = async () => {
    try {
        console.log('🔄 Attempting login via API...');
        console.log('📧 Email: admin@tpia.com');
        console.log('🔑 Password: Topia@2025');

        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@tpia.com',
            password: 'Topia@2025'
        });

        console.log('\n✅✅ LOGIN SUCCESSFUL! ✅✅');
        console.log('Token received:', response.data.token.substring(0, 20) + '...');
        console.log('User:', response.data.name);
        console.log('Is Admin:', response.data.isAdmin);

    } catch (error) {
        console.log('\n❌❌ LOGIN FAILED ❌❌');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
};

login();
