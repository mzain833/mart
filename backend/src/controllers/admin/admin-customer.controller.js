
import adminCustomerService from "../../services/admin/admin-customer.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

const getAdminCustomers = async (req, res, next) => {
  try {
    const result = await adminCustomerService.getAdminCustomers(
      req.query
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result,
        "Customers retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const getAdminCustomerById = async (req, res, next) => {
  try {
    const result = await adminCustomerService.getAdminCustomerById(
      req.params.customerId
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result,
        "Customer details retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const updateCustomerStatus = async (req, res, next) => {
  try {
    const customer = await adminCustomerService.updateCustomerStatus(
      req.params.customerId,
      req.body?.isActive
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { customer },
        "Customer status updated successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const adminCustomerController = {
  getAdminCustomers,
  getAdminCustomerById,
  updateCustomerStatus,
};

export default adminCustomerController;
