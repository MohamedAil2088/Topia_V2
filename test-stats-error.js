const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        // Add a fake auth token to bypass auth (we'll see the real error)
        'Authorization': 'Bearer fake-token-for-testing'
    }
};

console.log('Testing /api/admin/stats with fake auth...\n');

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}\n`);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.error('Connection Error:', error.message);
});

req.end();
