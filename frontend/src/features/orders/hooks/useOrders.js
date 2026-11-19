import { useCallback, useEffect, useState } from "react";

import orderService from "../services/orderService";

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await orderService.getMyOrders();

      setOrders(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  return {
    orders,
    loading,
    error,
    refreshOrders,
  };
};

export default useOrders;