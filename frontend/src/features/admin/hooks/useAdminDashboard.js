
import { useCallback, useEffect, useState } from "react";

import adminService from "../services/adminService";

const useAdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (signal) => {
    try {
      setError("");

      const data = await adminService.getDashboard({ signal });

      setDashboard(data);
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchDashboard(controller.signal);

    return () => controller.abort();
  }, [fetchDashboard]);

  const refreshDashboard = useCallback(() => {
    setIsLoading(true);
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    isLoading,
    error,
    refreshDashboard,
  };
};

export default useAdminDashboard;
