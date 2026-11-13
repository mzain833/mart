
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAccount from "../hooks/useAccount";

const ProtectedAccountRoute = () => {
  const { isAuthenticated } = useAccount();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedAccountRoute;
