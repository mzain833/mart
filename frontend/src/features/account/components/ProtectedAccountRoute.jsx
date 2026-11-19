
import { Navigate, Outlet } from "react-router-dom";

import useAccount from "../hooks/useAccount";

const ProtectedAccountRoute = () => {
  const {
    isAuthenticated,
    isLoading,
  } = useAccount();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAccountRoute;
