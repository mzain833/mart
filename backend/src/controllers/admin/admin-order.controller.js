
import adminOrderService from "../../services/admin/admin-order.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

const getAdminOrders = async (req, res, next) => {
  try {
    const result = await adminOrderService.getAdminOrders(req.query);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result,
        "Admin orders retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await adminOrderService.getAdminOrderById(
      req.params.orderId
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { order },
        "Order details retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const updateAdminOrderStatus = async (req, res, next) => {
  try {
    const order = await adminOrderService.updateAdminOrderStatus(
      req.params.orderId,
      req.body.status,
      req.body.note
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { order },
        "Order status updated successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const cancelAdminOrder = async (req, res, next) => {
  try {
    const order = await adminOrderService.cancelAdminOrder(
      req.params.orderId,
      req.body.reason
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { order },
        "Order cancelled successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const adminOrderController = {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  cancelAdminOrder,
};

export default adminOrderController;
