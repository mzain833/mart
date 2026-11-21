
import { useCallback, useEffect, useState } from "react";

import adminOrderService from "../services/adminOrderService";

const INITIAL_FILTERS = {
  search: "",
  status: "",
  paymentStatus: "",
  paymentMethod: "",
  from: "",
  to: "",
  sort: "newest",
  page: 1,
  limit: 12,
};

const INITIAL_PAGINATION = {
  page: 1,
  limit: 12,
  total: 0,
  pages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Orders load nahi ho sakay. Dobara koshish karein.";

const useAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await adminOrderService.getOrders(
          filters,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        setOrders(result.orders || []);
        setPagination({
          ...INITIAL_PAGINATION,
          ...result.pagination,
        });
      } catch (requestError) {
        if (controller.signal.aborted) return;

        setError(getErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, [filters, refreshKey]);

  const updateFilter = useCallback((key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page: 1,
    }));
  }, []);

  const applySearch = useCallback((event) => {
    event?.preventDefault();

    setFilters((previous) => ({
      ...previous,
      search: searchInput.trim(),
      page: 1,
    }));
  }, [searchInput]);

  const changePage = useCallback((page) => {
    setFilters((previous) => ({
      ...previous,
      page,
    }));
  }, []);

  const refreshOrders = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  return {
    orders,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    isLoading,
    error,
    updateFilter,
    applySearch,
    changePage,
    refreshOrders,
  };
};

export default useAdminOrders;
