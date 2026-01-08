const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log('Testing /api/admin/stats endpoint...');

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 401) {
            console.log('✅ Endpoint exists but requires authentication (401 Unauthorized) - This is EXPECTED!');
        } else if (res.statusCode === 200) {
            console.log('✅ Endpoint working perfectly!');
            console.log('Response:', data);
        } else {
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Connection Error:', error.message);
    console.log('💡 Make sure the backend server is running on port 5000');
});

req.end();
