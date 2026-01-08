const http = require('http');

function testCategoriesAPI() {
    console.log('🔍 Testing Categories API...\n');

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/categories',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                const categories = json.data || json;

                console.log('📂 API Response:');
                console.log('='.repeat(80));

                categories.forEach((cat, i) => {
                    console.log(`${i + 1}. ${cat.name}`);
                    console.log(`   Image: ${cat.image || 'NO IMAGE FIELD!'}`);
                    console.log(`   Slug: ${cat.slug}`);
                    console.log('');
                });

                console.log('='.repeat(80));
                console.log(`\n✅ API is working! Found ${categories.length} categories`);

                const withImages = categories.filter(c => c.image && c.image !== 'default-category.jpg').length;
                console.log(`📸 Categories with custom images: ${withImages}`);
            } catch (error) {
                console.error('❌ Parse Error:', error.message);
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Connection Error:', error.message);
        console.log('\n💡 Make sure backend is running on http://localhost:5000');
    });

    req.end();
}

testCategoriesAPI();
