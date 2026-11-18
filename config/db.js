const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // If no URI provided, use in-memory MongoDB in development
    if (!mongoUri || mongoUri.trim() === '') {
      console.log('⚡ No MONGODB_URI found. Initializing MongoMemoryServer for development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServerInstance = await MongoMemoryServer.create();
        mongoUri = mongoServerInstance.getUri();
        console.log(`✅ Embedded In-Memory MongoDB running at: ${mongoUri}`);
      } catch (memErr) {
        console.warn('⚠️ Could not initialize MongoMemoryServer, falling back to local mongodb://localhost:27017/medshare');
        mongoUri = 'mongodb://127.0.0.1:27017/medshare';
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`🌿 Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If connection to localhost failed and we haven't tried memory server yet:
    if (!mongoServerInstance) {
      console.log('🔄 Attempting fallback to MongoMemoryServer...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServerInstance = await MongoMemoryServer.create();
        const fallbackUri = mongoServerInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback In-Memory MongoDB connected at: ${fallbackUri}`);
        return conn;
      } catch (fallbackErr) {
        console.error('❌ Fallback failed:', fallbackErr.message);
      }
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServerInstance) {
      await mongoServerInstance.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
