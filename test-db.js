require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...');
const uri = process.env.MONGODB_URI;
console.log('URI exists:', !!uri);
if (uri) {
    console.log('URI starts with:', uri.substring(0, 15) + '...');
}

mongoose.connect(uri)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    });
