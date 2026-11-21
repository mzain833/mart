
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Filter,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import useAdminCustomers from "../hooks/useAdminCustomers";
import "./admin-customers.css";

const SORT_OPTIONS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["name_asc", "Name A-Z"],
  ["name_desc", "Name Z-A"],
];

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-PK", {
        dateStyle: "medium",
      }).format(date);
};

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const AdminCustomers = () => {
  const {
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
  } = useAdminCustomers();

  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = useMemo(
    () => Boolean(filters.status || filters.search),
    [filters.status, filters.search]
  );

  const clearFilters = () => {
    setSearchInput("");

    updateFilter("search", "");
    updateFilter("status", "");
    updateFilter("sort", "newest");
  };

  return (
    <main className="admin-customers">
      <div className="admin-customers__container">
        <header className="admin-customers__header">
          <div>
            


            <span className="admin-customers__eyebrow">
              NEXAMART ADMINISTRATION
            </span>

            <h1>Customer Management</h1>

            <p>
              Manage customer accounts, monitor activity and review
              customer relationships.
            </p>
          </div>

          <div className="admin-customers__header-actions">
            <span className="admin-customers__secure">
              <ShieldCheck size={16} />
              Admin access
            </span>

            <button
              type="button"
              className="admin-customers__button"
              onClick={refreshCustomers}
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "is-spinning" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        <section className="admin-customers__overview">
          <div className="admin-customers__overview-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total matching customers</span>
            <strong>
              {pagination.total.toLocaleString("en-PK")}
            </strong>
            <small>
              {pagination.pages
                ? `Page ${pagination.page} of ${pagination.pages}`
                : "No pages available"}
            </small>
          </div>
        </section>

        <section className="admin-customers__panel">
          <div className="admin-customers__panel-header">
            <div>
              <h2>All customers</h2>
              <p>Search and manage registered customer accounts.</p>
            </div>

            <button
              type="button"
              className="admin-customers__filter-toggle"
              onClick={() => setShowFilters((previous) => !previous)}
              aria-expanded={showFilters}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          <form
            className="admin-customers__search"
            onSubmit={applySearch}
          >
            <Search size={18} />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, email or phone..."
              aria-label="Search customers"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilter("search", "");
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

            <button type="submit" className="admin-customers__search-submit">
              Search
            </button>
          </form>

          {showFilters && (
            <div className="admin-customers__filters">
              <label>
                Account status
                <select
                  value={filters.status}
                  onChange={(event) =>
                    updateFilter("status", event.target.value)
                  }
                >
                  <option value="">All customers</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label>
                Sort by
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    updateFilter("sort", event.target.value)
                  }
                >
                  {SORT_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="admin-customers__reset"
                  onClick={clearFilters}
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="admin-customers__error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={refreshCustomers}>
                Try again
              </button>
            </div>
          )}

          <div className="admin-customers__table-wrap">
            <table className="admin-customers__table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Order value</th>
                  <th>Account</th>
                  <th>Joined</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="admin-customers__state">
                      <LoaderCircle className="is-spinning" size={25} />
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-customers__state">
                      <Users size={28} />
                      <strong>No customers found</strong>
                      <span>
                        Try changing your search or filter criteria.
                      </span>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <div className="admin-customers__identity">
                          <span className="admin-customers__avatar">
                            {(customer.fullName || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </span>

                          <div>
                            <strong>{customer.fullName}</strong>
                            <span>{customer.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>{customer.phone || "—"}</td>

                      <td>
                        <strong>
                          {customer.orderStats?.totalOrders ?? 0}
                        </strong>
                      </td>

                      <td className="admin-customers__amount">
                        {formatPrice(
                          customer.orderStats?.totalOrderValue
                        )}
                      </td>

                      <td>
                        <span
                          className={`admin-customers__status ${
                            customer.isActive ? "is-active" : "is-inactive"
                          }`}
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>{formatDate(customer.createdAt)}</td>

                      <td>
                        <Link
  to={`/admin/customers/${customer._id}`}
  className="admin-customers__view"
  aria-label={`View ${customer.fullName}`}
>
  <Eye size={15} />
  <span>View</span>
</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="admin-customers__pagination">
            <span>
              Showing {customers.length} of {pagination.total} customers
            </span>

            <div>
              <button
                type="button"
                onClick={() => changePage(pagination.page - 1)}
                disabled={isLoading || !pagination.hasPreviousPage}
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <span>
                {pagination.page} / {Math.max(pagination.pages, 1)}
              </span>

              <button
                type="button"
                onClick={() => changePage(pagination.page + 1)}
                disabled={isLoading || !pagination.hasNextPage}
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default AdminCustomers;
