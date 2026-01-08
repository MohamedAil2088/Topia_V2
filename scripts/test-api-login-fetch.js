const login = async () => {
    try {
        console.log('🔄 Attempting login via API (fetch)...');

        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@tpia.com',
                password: 'Topia@2025'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('\n✅✅ LOGIN SUCCESSFUL! ✅✅');
            console.log('User:', data.name);
            console.log('Token:', data.token ? 'Yes' : 'No');
        } else {
            console.log('\n❌❌ LOGIN FAILED ❌❌');
            console.log('Message:', data.message);
        }

    } catch (error) {
        console.log('\n❌❌ NETWORK/SERVER ERROR ❌❌');
        console.log('Error:', error.message);
    }
};

login();
