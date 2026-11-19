
import productService from "../../services/product/product.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";
import imageService from "../../services/product/image.service.js";
import ApiError from "../../utils/ApiError.js";
const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result,
        "Products retrieved successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { product }, "Product retrieved successfully.")
    );
  } catch (error) {
    next(error);
  }
};




const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { categories }, "Categories retrieved successfully.")
    );
  } catch (error) {
    next(error);
  }
};

const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Please select at least one image."
      );
    }

    const images = await imageService.uploadProductImages(req.files);

    return res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(
        HTTP_STATUS.CREATED,
        { images },
        "Product images uploaded successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};




const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    return res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, { product }, "Product created successfully.")
    );
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body
    );

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { product }, "Product updated successfully.")
    );
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { product }, "Product deactivated successfully.")
    );
  } catch (error) {
    next(error);
  }
};

const productController = {
  getProducts,
  getProductBySlug,
  getCategories,
  uploadProductImages,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productController;
