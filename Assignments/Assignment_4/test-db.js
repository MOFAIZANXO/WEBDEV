const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { ssl: true });
        console.log('MongoDB connected successfully');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Connection error:', error);
    }
}

testConnection();