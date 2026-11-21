
import apiClient from "../../../lib/apiClient";

const BASE_URL = "/admin/customers";

const sanitizeParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

const adminCustomerService = {
  async getCustomers(params = {}, { signal } = {}) {
    const response = await apiClient.get(BASE_URL, {
      params: sanitizeParams(params),
      signal,
    });

    return response.data.data;
  },

  async getCustomerById(customerId, { signal } = {}) {
    const response = await apiClient.get(
      `${BASE_URL}/${encodeURIComponent(customerId)}`,
      { signal }
    );

    return response.data.data;
  },

  async updateCustomerStatus(customerId, isActive) {
    const response = await apiClient.patch(
      `${BASE_URL}/${encodeURIComponent(customerId)}/status`,
      { isActive }
    );

    return response.data.data.customer;
  },
};

export default adminCustomerService;
