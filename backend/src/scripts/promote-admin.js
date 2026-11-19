
import "dotenv/config";
import mongoose from "mongoose";

import User from "../models/user/User.model.js";

const promoteAdmin = async () => {
  const databaseUri = process.env.MONGODB_URI;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!databaseUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is not configured.");
  }

  await mongoose.connect(databaseUri);

  const user = await User.findOne({ email: adminEmail }).select(
    "_id email role isActive"
  );

  if (!user) {
    throw new Error("No account found for the specified admin email.");
  }

  if (!user.isActive) {
    throw new Error("Inactive accounts cannot be promoted.");
  }

  if (user.role === "admin") {
    console.log("Account already has admin privileges.");
    return;
  }

  if (user.role !== "customer") {
    throw new Error("Account has an unsupported role.");
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      role: "customer",
      isActive: true,
    },
    {
      $set: { role: "admin" },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("_id email role");

  if (!updatedUser) {
    throw new Error("Admin promotion failed. Please retry.");
  }

  console.log("Admin account successfully promoted.");
  console.log(`Email: ${updatedUser.email}`);
  console.log(`Role: ${updatedUser.role}`);
};

try {
  await promoteAdmin();
} catch (error) {
  console.error("Admin promotion failed:", error.message);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
