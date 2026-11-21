
import { useEffect, useState } from "react";
import {
  Activity,
  Boxes,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAccount from "../../account/hooks/useAccount";

import "./admin-layout.css";

const NAVIGATION_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: Boxes,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
];

const AdminLayout = () => {
  const { currentUser, logout } = useAccount();

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const administratorName =
    currentUser?.fullName ||
    currentUser?.name ||
    "Administrator";

  const administratorEmail = currentUser?.email || "";

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();

      navigate("/login", { replace: true });
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="admin-layout">
      {isMobileOpen && (
        <button
          type="button"
          className="admin-layout__overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`admin-sidebar ${
          isMobileOpen ? "is-open" : ""
        }`}
        aria-label="Admin sidebar"
      >
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">
            <ShoppingBag size={23} />
          </div>

          <div className="admin-sidebar__brand-text">
            <strong>NEXAMART</strong>
            <span>ADMINISTRATION</span>
          </div>

          <button
            type="button"
            className="admin-sidebar__close"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar__workspace">
          <span className="admin-sidebar__workspace-icon">
            <ShieldCheck size={17} />
          </span>

          <div>
            <strong>Admin Workspace</strong>
            <span>Secure environment</span>
          </div>

          <span className="admin-sidebar__online" />
        </div>

        <nav className="admin-sidebar__navigation">
          <span className="admin-sidebar__section-label">
            WORKSPACE
          </span>

          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `admin-sidebar__link ${
                    isActive ? "is-active" : ""
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
                <ChevronLeft
                  size={15}
                  className="admin-sidebar__active-indicator"
                />
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-sidebar__administrator">
            <span className="admin-sidebar__avatar">
              {administratorName.charAt(0).toUpperCase()}
            </span>

            <div className="admin-sidebar__administrator-info">
              <strong>{administratorName}</strong>
              <span>{administratorEmail || "Administrator"}</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={17} />
            <span>
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </span>
          </button>

          <div className="admin-sidebar__version">
            <Activity size={13} />
            NexaMart Administration
          </div>
        </div>
      </aside>

      <div className="admin-layout__main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              type="button"
              className="admin-topbar__menu"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open navigation"
              aria-expanded={isMobileOpen}
            >
              <Menu size={21} />
            </button>

            <div className="admin-topbar__breadcrumb">
              <span>Workspace</span>
              <span>/</span>
              <strong>
                {NAVIGATION_ITEMS.find(
                  (item) =>
                    item.end
                      ? location.pathname === item.path
                      : location.pathname.startsWith(item.path)
                )?.label || "Administration"}
              </strong>
            </div>
          </div>

          <div className="admin-topbar__right">
           <span className="admin-topbar__status">
  <ShieldCheck size={15} />
  Administrator workspace
</span>

            <div className="admin-topbar__identity">
              <span className="admin-topbar__avatar">
                {administratorName.charAt(0).toUpperCase()}
              </span>
              <span>{administratorName}</span>
            </div>
          </div>
        </header>

        <div className="admin-layout__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
