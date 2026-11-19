
import jwt from "jsonwebtoken";

import User from "../../models/user/User.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: "nexamart-api",
      audience: "nexamart-client",
    }
  );
};

const sanitizeUser = (user) => {
  const userData = user.toObject();

  delete userData.password;

  return userData;
};

const register = async (values) => {
  const existingUser = await User.findOne({
    email: values.email,
  });

  if (existingUser) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "An account with this email already exists."
    );
  }

  try {
    const user = await User.create({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });

    return {
      user: sanitizeUser(user),
      token: generateToken(user),
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "An account with this email already exists."
      );
    }

    throw error;
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid email address or password."
    );
  }

  if (!user.isActive) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "This account is currently unavailable."
    );
  }

  return {
    user: sanitizeUser(user),
    token: generateToken(user),
  };
};

const updateProfile = async (userId, values) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName: values.fullName,
        phone: values.phone,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select(
    "_id fullName email phone role isActive createdAt updatedAt"
  );

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "User account not found."
    );
  }

  return user;
};

const authService = {
  register,
  login,
  updateProfile,
};

export default authService;
