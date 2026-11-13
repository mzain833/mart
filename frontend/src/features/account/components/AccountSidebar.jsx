
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  Package,
  LogOut,
} from "lucide-react";

import useAccount from "../hooks/useAccount";

const navigation = [
  { label: "Dashboard", path: "/account", icon: LayoutDashboard, end: true },
  { label: "My Profile", path: "/account/profile", icon: UserRound },
  { label: "My Orders", path: "/account/orders", icon: Package },
];

const AccountSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAccount();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="account-sidebar">
      <div className="account-sidebar-heading">MY ACCOUNT</div>

      <nav className="account-sidebar-nav">
        {navigation.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `account-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="account-logout-button"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </aside>
  );
};

export default AccountSidebar;
