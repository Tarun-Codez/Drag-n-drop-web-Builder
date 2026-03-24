const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  // If no Mongo URI is provided, we intentionally continue in memory mode.
  if (!mongoUri) {
    console.warn('[DB] No MONGO_URI found. Running in memory mode.');
    return { connected: false, mode: 'memory' };
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('[DB] MongoDB connected successfully.');
    return { connected: true, mode: 'mongo' };
  } catch (error) {
    console.warn(`[DB] Mongo connection failed (${error.message}). Falling back to memory mode.`);
    return { connected: false, mode: 'memory' };
  }
}

module.exports = { connectDB };
