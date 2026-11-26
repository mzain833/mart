import shippingService from "../../services/shipping/shipping.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

const getShippingQuote = async (req, res, next) => {
  try {
    const quote = await shippingService.getShippingQuote(req.body);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { quote },
        "Shipping quote retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const customerShippingController = {
  getShippingQuote,
};

export default customerShippingController;