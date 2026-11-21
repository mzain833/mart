
import apiClient from "../../../lib/apiClient";

const ADMIN_CATEGORIES_ENDPOINT = "/admin/categories";

const adminCategoryService = {
  async getCategories({ signal } = {}) {
    const response = await apiClient.get(ADMIN_CATEGORIES_ENDPOINT, {
      signal,
    });

    return response.data.data.categories;
  },

  async createCategory(payload) {
    const response = await apiClient.post(
      ADMIN_CATEGORIES_ENDPOINT,
      payload
    );

    return response.data.data.category;
  },

  async updateCategory(categoryId, payload) {
    const response = await apiClient.patch(
      `${ADMIN_CATEGORIES_ENDPOINT}/${categoryId}`,
      payload
    );

    return response.data.data.category;
  },

  async activateCategory(categoryId) {
    const response = await apiClient.patch(
      `${ADMIN_CATEGORIES_ENDPOINT}/${categoryId}/activate`
    );

    return response.data.data.category;
  },

  async deactivateCategory(categoryId) {
    const response = await apiClient.patch(
      `${ADMIN_CATEGORIES_ENDPOINT}/${categoryId}/deactivate`
    );

    return response.data.data.category;
  },
};

export default adminCategoryService;
