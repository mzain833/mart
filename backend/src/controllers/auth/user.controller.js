
import authService from "../../services/auth/auth.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

const getCurrentUser = (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user: req.user },
      "Account retrieved successfully."
    )
  );
};

const updateCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(
      req.user._id,
      req.body
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { user },
        "Profile updated successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

const userController = {
  getCurrentUser,
  updateCurrentUser,
};

export default userController;
