
import { useCallback, useEffect, useState } from "react";

import adminCustomerService from "../services/adminCustomerService";

const INITIAL_FILTERS = {
  search: "",
  status: "",
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
  "Customers load nahi ho sakay. Dobara koshish karein.";

const useAdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCustomers = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await adminCustomerService.getCustomers(
          filters,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        setCustomers(result.customers || []);
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

    fetchCustomers();

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

  const refreshCustomers = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  return {
    customers,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    isLoading,
    error,
    updateFilter,
    applySearch,
    changePage,
    refreshCustomers,
  };
};

export default useAdminCustomers;
