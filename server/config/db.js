const mongoose = require('mongoose');
const standardConnString = "mongodb://linsteve124:Kiguruyembe123@ac-rdpopjy-shard-00-00.4dq05si.mongodb.net:27017,ac-rdpopjy-shard-00-01.4dq05si.mongodb.net:27017,ac-rdpopjy-shard-00-02.4dq05si.mongodb.net:27017/test?ssl=true&replicaSet=atlas-19zq6s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Kiguruyembe";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to MongoDB');
    } catch (e) {
        console.error('MongoDB connection error:', e.message);
        process.exit(1);
    }
};

module.exports = connectDB;