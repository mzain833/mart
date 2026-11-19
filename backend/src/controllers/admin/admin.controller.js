
import adminService from "../../services/admin/admin.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

const getDashboardStats = async (req, res, next) => {
  try {
    const dashboard = await adminService.getDashboardStats();

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        dashboard,
        "Admin dashboard data retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const result = await adminService.getAdminProducts(req.query);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result,
        "Admin products retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const getAdminProductById = async (req, res, next) => {
  try {
    const product = await adminService.getAdminProductById(
      req.params.id
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { product },
        "Product retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const activateProduct = async (req, res, next) => {
  try {
    const product = await adminService.activateProduct(req.params.id);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { product },
        "Product activated successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const deactivateProduct = async (req, res, next) => {
  try {
    const product = await adminService.deactivateProduct(req.params.id);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { product },
        "Product deactivated successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const adminController = {
  getDashboardStats,
  getAdminProducts,
  getAdminProductById,
  activateProduct,
  deactivateProduct,
};

export default adminController;
