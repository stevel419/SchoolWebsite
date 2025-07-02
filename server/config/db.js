const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            serverApi: { version: '1', strict: true, deprecationErrors: true },
            connectTimeoutMS: 5000
        });
        console.log('Successfully connected to MongoDB');
    } catch (e) {
        console.error('MongoDB connection error:', e.message);
        process.exit(1);
    }
};

module.exports = connectDB;