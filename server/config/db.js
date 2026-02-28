const mongoose = require('mongoose');
require('dotenv').config();

let mongoServer;
let usingMemoryServer = false;

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-manager';
    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log('Local MongoDB not available, starting in-memory server...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongoServer = await MongoMemoryServer.create();
            const memUri = mongoServer.getUri();
            const conn = await mongoose.connect(memUri);
            usingMemoryServer = true;
            console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
        } catch (memError) {
            console.error(`Error: ${memError.message}`);
            process.exit(1);
        }
    }
};

const isMemoryServer = () => usingMemoryServer;

module.exports = connectDB;
module.exports.isMemoryServer = isMemoryServer;
