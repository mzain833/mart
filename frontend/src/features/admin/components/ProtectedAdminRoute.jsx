import { Navigate, Outlet } from "react-router-dom";

import useAccount from "../../account/hooks/useAccount";

const ProtectedAdminRoute = () => {
  const {
    currentUser,
    isAuthenticated,
    isLoading,
  } = useAccount();

  if (isLoading) {
    return (
      <div className="admin-auth-loading" role="status">
        Verifying administrator access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;