
import shippingService from "../../services/shipping/shipping.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

const getAdminShippingZones = async (req, res, next) => {
  try {
    const result = await shippingService.getAdminShippingZones(
      req.query
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result,
        "Shipping zones retrieved successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const createShippingZone = async (req, res, next) => {
  try {
    const zone = await shippingService.createShippingZone(req.body);

    return res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        { zone },
        "Shipping zone created successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const updateShippingZone = async (req, res, next) => {
  try {
    const zone = await shippingService.updateShippingZone(
      req.params.id,
      req.body
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { zone },
        "Shipping zone updated successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const activateShippingZone = async (req, res, next) => {
  try {
    const zone = await shippingService.activateShippingZone(
      req.params.id
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { zone },
        "Shipping zone activated successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const deactivateShippingZone = async (req, res, next) => {
  try {
    const zone = await shippingService.deactivateShippingZone(
      req.params.id
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { zone },
        "Shipping zone deactivated successfully."
      )
    );
  } catch (error) {
    return next(error);
  }
};

const shippingController = {
  getAdminShippingZones,
  createShippingZone,
  updateShippingZone,
  activateShippingZone,
  deactivateShippingZone,
};

export default shippingController;
