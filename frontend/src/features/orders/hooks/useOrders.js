import { useMemo, useSyncExternalStore } from "react";
import orderService from "../services/orderService";

const useOrders = (email) => {
  const allOrders = useSyncExternalStore(
    orderService.subscribe,
    orderService.getOrdersSnapshot,
    () => []
  );

  const orders = useMemo(
    () => orderService.getOrdersByEmail(email),
    [allOrders, email]
  );

  return { orders };
};

export default useOrders;