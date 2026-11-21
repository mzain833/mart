
import { useCallback, useEffect, useState } from "react";

import adminCategoryService from "../services/adminCategoryService";

const useAdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async (signal) => {
    try {
      setError("");

      const data = await adminCategoryService.getCategories({ signal });

      setCategories(Array.isArray(data) ? data : []);
    } catch (requestError) {
      if (
        requestError.code === "ERR_CANCELED" ||
        signal?.aborted
      ) {
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "Categories load nahi ho sakin."
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchCategories(controller.signal);

    return () => controller.abort();
  }, [fetchCategories]);

  const refreshCategories = useCallback(() => {
    setIsLoading(true);
    fetchCategories();
  }, [fetchCategories]);

  const toggleCategoryStatus = useCallback(async (category) => {
    try {
      setActionLoading(category._id);
      setError("");

      if (category.isActive) {
        await adminCategoryService.deactivateCategory(category._id);
      } else {
        await adminCategoryService.activateCategory(category._id);
      }

      await fetchCategories();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Category status update nahi ho saka."
      );
    } finally {
      setActionLoading("");
    }
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    actionLoading,
    error,
    refreshCategories,
    toggleCategoryStatus,
  };
};

export default useAdminCategories;
