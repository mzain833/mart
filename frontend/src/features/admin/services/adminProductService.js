
import apiClient from "../../../lib/apiClient";

const adminProductService = {
  async getProducts(params = {}, { signal } = {}) {
    const response = await apiClient.get("/admin/products", {
      params,
      signal,
    });

    return response.data.data;
  },

  async getProductById(productId, { signal } = {}) {
    const response = await apiClient.get(
      `/admin/products/${productId}`,
      { signal }
    );

    return response.data.data.product;
  },

  async uploadProductImages(files) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error("Kam az kam aik image select karein.");
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await apiClient.post(
      "/products/images",
      formData
    );

    return response.data.data.images;
  },

  async createProduct(payload) {
    const response = await apiClient.post("/products", payload);

    return response.data.data.product ?? response.data.data;
  },

  async updateProduct(productId, payload) {
    const response = await apiClient.patch(
      `/products/${productId}`,
      payload
    );

    return response.data.data.product ?? response.data.data;
  },

  async activateProduct(productId) {
    const response = await apiClient.patch(
      `/admin/products/${productId}/activate`
    );

    return response.data.data.product;
  },

  async deactivateProduct(productId) {
    const response = await apiClient.patch(
      `/admin/products/${productId}/deactivate`
    );

    return response.data.data.product;
  },
};

export default adminProductService;
