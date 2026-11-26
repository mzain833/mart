import apiClient from "../../../lib/apiClient.js";

const getResponseData = (response) => response.data?.data;

const getMyOrders = async () => {
  const response = await apiClient.get("/orders/my-orders");

  return getResponseData(response)?.orders ?? [];
};

const getMyOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);

  return getResponseData(response)?.order ?? null;
};

const getGuestOrderConfirmation = async (orderId, accessToken) => {
  const response = await apiClient.post(
    `/orders/guest/${orderId}/confirmation`,
    { accessToken }
  );

  return getResponseData(response)?.order ?? null;
};

const createOrder = async ({
  customer,
  items,
  deliveryMethod = "standard",
  paymentMethod = "cod",
}) => {
  const payload = {
    customer,
    items: items.map(({ product, quantity }) => ({
      sku: product.sku || product.id,
      quantity,
    })),
    deliveryMethod,
    paymentMethod,
  };

  const response = await apiClient.post("/orders", payload);

  const result = getResponseData(response);

  if (!result?.order) {
    throw new Error("Order could not be created. Please try again.");
  }

  return result;
};

const cancelOrder = async (orderId, reason) => {
  const response = await apiClient.patch(
    `/orders/${orderId}/cancel`,
    { reason }
  );

  return getResponseData(response)?.order ?? null;
};
const getShippingQuote = async (address, { signal } = {}) => {
  const response = await apiClient.post(
    "/shipping/quote",
    {
      city: address.city,
      province: address.province,
      area: address.area,
    },
    { signal }
  );

  return getResponseData(response)?.quote ?? null;
};


const orderService = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getGuestOrderConfirmation,
  cancelOrder,
  getShippingQuote,
};

export default orderService;