
import mongoose from "mongoose";

const DATABASE_OPTIONS = Object.freeze({
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
});

const connectDatabase = async () => {
  const databaseUri = process.env.MONGODB_URI;

  if (!databaseUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const connection = await mongoose.connect(
    databaseUri,
    DATABASE_OPTIONS
  );

  console.log(
    `MongoDB connected: ${connection.connection.host}`
  );

  return connection;
};

export default connectDatabase;
