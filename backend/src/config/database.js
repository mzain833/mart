
import mongoose from "mongoose";

const connectDatabase = async () => {
  const databaseUri = process.env.MONGODB_URI;

  if (!databaseUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const connection = await mongoose.connect(databaseUri);

  console.log(
    `MongoDB connected: ${connection.connection.host}`
  );

  return connection;
};

export default connectDatabase;
