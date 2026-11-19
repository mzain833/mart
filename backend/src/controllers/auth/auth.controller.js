
import authService from "../../services/auth/auth.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

const COOKIE_NAME = "nexamart_access_token";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        { user },
        "Account created successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { user },
        "Signed in successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  const options = getCookieOptions();
  delete options.maxAge;

  res.clearCookie(COOKIE_NAME, options);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      null,
      "Signed out successfully."
    )
  );
};

const authController = {
  register,
  login,
  logout,
};

export default authController;
