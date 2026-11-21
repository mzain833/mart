
import categoryService from "../../services/category/category.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

const getPublicCategories = async (req, res) => {
  const categories = await categoryService.getPublicCategories();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { categories },
      "Categories fetched successfully."
    )
  );
};

const getCategoryBySlug = async (req, res) => {
  const category = await categoryService.getCategoryBySlug(
    req.params.slug
  );

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { category },
      "Category fetched successfully."
    )
  );
};

const getAdminCategories = async (req, res) => {
  const result = await categoryService.getAdminCategories(req.query);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      result,
      "Categories fetched successfully."
    )
  );
};

const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(
      HTTP_STATUS.CREATED,
      { category },
      "Category created successfully."
    )
  );
};

const updateCategory = async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body
  );

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { category },
      "Category updated successfully."
    )
  );
};

const deactivateCategory = async (req, res) => {
  const category = await categoryService.deactivateCategory(
    req.params.id
  );

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { category },
      "Category deactivated successfully."
    )
  );
};

const activateCategory = async (req, res) => {
  const category = await categoryService.activateCategory(
    req.params.id
  );

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { category },
      "Category activated successfully."
    )
  );
};

const categoryController = {
  getPublicCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
};

export default categoryController;
