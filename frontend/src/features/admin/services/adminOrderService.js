
import apiClient from "../../../lib/apiClient";

const BASE_URL = "/admin/orders";

const sanitizeParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

const adminOrderService = {
  async getOrders(params = {}, { signal } = {}) {
    const response = await apiClient.get(BASE_URL, {
      params: sanitizeParams(params),
      signal,
    });

    return response.data.data;
  },

  async getOrderById(orderId, { signal } = {}) {
    const response = await apiClient.get(
      `${BASE_URL}/${encodeURIComponent(orderId)}`,
      { signal }
    );

    return response.data.data.order;
  },

  async updateOrderStatus(orderId, payload) {
    const response = await apiClient.patch(
      `${BASE_URL}/${encodeURIComponent(orderId)}/status`,
      payload
    );

    return response.data.data.order;
  },

  async cancelOrder(orderId, reason) {
    const response = await apiClient.patch(
      `${BASE_URL}/${encodeURIComponent(orderId)}/cancel`,
      { reason }
    );

    return response.data.data.order;
  },
};

export default adminOrderService;
