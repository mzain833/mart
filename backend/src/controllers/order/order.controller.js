
import orderService from "../../services/order/order.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

const createOrder = async (req, res, next) => {
  try {
    const result = await orderService.createOrder({
      customer: req.body.customer,
      items: req.body.items,
      deliveryMethod: req.body.deliveryMethod,
      paymentMethod: req.body.paymentMethod,
      userId: req.user?._id || null,
    });

    return res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        result,
        "Order placed successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getCustomerOrders(req.user._id);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { orders },
        "Orders retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const getMyOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getCustomerOrderById(
      req.params.orderId,
      req.user._id
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { order },
        "Order retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const getGuestOrderConfirmation = async (req, res, next) => {
  try {
    const order = await orderService.getGuestOrderConfirmation(
      req.params.orderId,
      req.body.accessToken
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { order },
        "Order confirmation retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(
      req.params.orderId,
      req.user._id,
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

const orderController = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getGuestOrderConfirmation,
  cancelOrder,
};

export default orderController;
