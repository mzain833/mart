
import { useCallback, useEffect, useRef, useState } from "react";

import adminService from "../services/adminService";

const useAdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const controllerRef = useRef(null);

  const fetchDashboard = useCallback(async (signal) => {
    setError("");

    try {
      const data = await adminService.getDashboard({ signal });

      if (!signal?.aborted) {
        setDashboard(data);
      }
    } catch (requestError) {
      if (
        !signal?.aborted &&
        requestError.code !== "ERR_CANCELED"
      ) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load dashboard data. Please try again."
        );
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

    fetchDashboard(controller.signal);

    return () => {
      controller.abort();
      controllerRef.current = null;
    };
  }, [fetchDashboard]);

  const refreshDashboard = useCallback(() => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    fetchDashboard(controller.signal);
  }, [fetchDashboard]);

  return {
    dashboard,
    isLoading,
    error,
    refreshDashboard,
  };
};

export default useAdminDashboard;
