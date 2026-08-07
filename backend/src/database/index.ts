
import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ??
  // Local dev fallback so `npm run dev` outside Docker still works.
  // Override MONGODB_URI in the root .env for any non-local environment.
  'mongodb://localhost:27017/expiner';

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is not set. Copy .env.example to .env and set it there.'
  );
}

let cached = (global as any).mongoose as { conn: mongoose.Mongoose | null; promise: Promise<mongoose.Mongoose> | null };

if (!cached) {
  (global as any).mongoose = cached = { conn: null, promise: null };
}
export const dbConnection = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 100,
      minPoolSize: 25,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 60000,
      heartbeatFrequencyMS: 10000,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Db connected");
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
