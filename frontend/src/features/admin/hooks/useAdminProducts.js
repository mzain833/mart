
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import adminProductService from "../services/adminProductService";

const INITIAL_FILTERS = {
  search: "",
  category: "",
  status: "all",
  stockStatus: "all",
  sort: "newest",
  page: 1,
  limit: 12,
};

const useAdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async (signal) => {
    try {
      setError("");

      const params = {
        ...filters,
        category: filters.category || undefined,
      };

      const data = await adminProductService.getProducts(
        params,
        { signal }
      );

      setProducts(data.products);
      setCategories(data.categories);
      setPagination(data.pagination);
    } catch (requestError) {
      if (
        requestError.code === "ERR_CANCELED" ||
        signal?.aborted
      ) {
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    fetchProducts(controller.signal);

    return () => controller.abort();
  }, [fetchProducts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((current) => {
        if (current.search === searchInput.trim()) {
          return current;
        }

        return {
          ...current,
          search: searchInput.trim(),
          page: 1,
        };
      });
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const updateFilter = useCallback((name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: 1,
    }));
  }, []);

  const changePage = useCallback((page) => {
    setFilters((current) => ({
      ...current,
      page,
    }));
  }, []);

  const refreshProducts = useCallback(() => {
    setIsLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  const toggleProductStatus = useCallback(async (product) => {
    const productId = product._id;

    try {
      setActionLoading(productId);
      setError("");

      if (product.isActive) {
        await adminProductService.deactivateProduct(productId);
      } else {
        await adminProductService.activateProduct(productId);
      }

      await fetchProducts();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update product status. Please try again."
      );
    } finally {
      setActionLoading("");
    }
  }, [fetchProducts]);

  return {
    products,
    categories,
    pagination,
    filters,
    searchInput,
    setSearchInput,
    updateFilter,
    changePage,
    refreshProducts,
    toggleProductStatus,
    isLoading,
    actionLoading,
    error,
  };
};

export default useAdminProducts;
