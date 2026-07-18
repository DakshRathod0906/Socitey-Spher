import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod;

export const connectDatabase = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Close existing mongoose connections if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri);
};

export const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};

export const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};
