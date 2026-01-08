const axios = require('axios');

const testAPI = async () => {
    try {
        console.log('🔍 Testing API: http://localhost:5000/api/products\n');
        const response = await axios.get('http://localhost:5000/api/products');

        console.log(`✅ Status: ${response.status}`);
        console.log(`📦 Products returned: ${response.data.data?.length || response.data.products?.length || 'Unknown'}`);
        console.log('\n📄 Response structure:');
        console.log('Keys:', Object.keys(response.data));

        if (response.data.data) {
            console.log('\n✅ Products are in response.data.data');
        } else if (response.data.products) {
            console.log('\n✅ Products are in response.data.products');
        } else {
            console.log('\n⚠️  Unexpected response structure!');
            console.log(JSON.stringify(response.data, null, 2).substring(0, 500));
        }

    } catch (error) {
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
};

testAPI();
