
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import { Link } from "react-router-dom";

import useAdminProducts from "../hooks/useAdminProducts";
import AdminProductTable from "../components/AdminProductTable";

import "./admin-products.css";

const AdminProducts = () => {
  const {
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
  } = useAdminProducts();

  return (
    <main className="admin-products">
      <div className="admin-products__container">
        <header className="admin-products__header">
          <div>
            <Link to="/admin" className="admin-products__back">
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>

            <span className="admin-products__eyebrow">
              NEXAMART ADMINISTRATION
            </span>

            <h1>Product Management</h1>

            <p>
              Manage your catalog, monitor inventory and control
              product availability.
            </p>
          </div>

          <div className="admin-products__header-actions">
            <div className="admin-products__security">
              <ShieldCheck size={17} />
              Authorized Administrator
            </div>

            <button
              type="button"
              className="admin-products__refresh"
              onClick={refreshProducts}
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "is-spinning" : ""}
              />
              Refresh
            </button>

            <Link
              to="/admin/products/new"
              className="admin-products__add"
            >
              <Plus size={17} />
              Add Product
            </Link>
          </div>
        </header>

        <section className="admin-products__overview">
          <div>
            <span>Catalog overview</span>
            <strong>{pagination?.total ?? 0}</strong>
            <small>Total matching products</small>
          </div>

          <div>
            <span>Current page</span>
            <strong>{pagination?.page ?? 1}</strong>
            <small>Of {pagination?.pages ?? 0} pages</small>
          </div>

          <div>
            <span>Page size</span>
            <strong>{pagination?.limit ?? 12}</strong>
            <small>Products per page</small>
          </div>
        </section>

        <section className="admin-products__panel">
          <div className="admin-products__panel-heading">
            <div>
              <h2>Product Catalog</h2>
              <p>
                Search, filter and manage your store products.
              </p>
            </div>

            <SlidersHorizontal size={20} />
          </div>

          <div className="admin-products__filters">
            <div className="admin-products__search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search by product name or SKU..."
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                aria-label="Search products"
              />
            </div>

            <select
              value={filters.category}
              onChange={(event) =>
                updateFilter("category", event.target.value)
              }
              aria-label="Filter by category"
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(event) =>
                updateFilter("status", event.target.value)
              }
              aria-label="Filter by product status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.stockStatus}
              onChange={(event) =>
                updateFilter("stockStatus", event.target.value)
              }
              aria-label="Filter by stock status"
            >
              <option value="all">All inventory</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>

            <select
              value={filters.sort}
              onChange={(event) =>
                updateFilter("sort", event.target.value)
              }
              aria-label="Sort products"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {error && (
            <div className="admin-products__error" role="alert">
              <AlertTriangle size={18} />
              <span>{error}</span>

              <button type="button" onClick={refreshProducts}>
                Try again
              </button>
            </div>
          )}

          <AdminProductTable
            products={products}
            isLoading={isLoading}
            actionLoading={actionLoading}
            onToggleStatus={toggleProductStatus}
          />

          <footer className="admin-products__pagination">
            <span>
              Showing {products.length} of {pagination?.total ?? 0} products
            </span>

            <div>
              <button
                type="button"
                onClick={() => changePage(filters.page - 1)}
                disabled={
                  !pagination?.hasPreviousPage || isLoading
                }
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>

              <strong>
                {pagination?.page ?? 1}
                <span> / </span>
                {pagination?.pages ?? 0}
              </strong>

              <button
                type="button"
                onClick={() => changePage(filters.page + 1)}
                disabled={
                  !pagination?.hasNextPage || isLoading
                }
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </footer>
        </section>

        <footer className="admin-products__footer">
          <Package size={16} />
          <span>NexaMart secure product management workspace</span>
        </footer>
      </div>
    </main>
  );
};

export default AdminProducts;
