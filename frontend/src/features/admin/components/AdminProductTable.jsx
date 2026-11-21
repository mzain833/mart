
import {
  AlertTriangle,
  Edit3,
  LoaderCircle,
  Package,
  Power,
  PowerOff,
} from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getStockStatus = (value) => {
  const stock = Math.max(0, Number(value) || 0);

  if (stock === 0) {
    return { label: "Out of stock", className: "out" };
  }

  if (stock <= 5) {
    return { label: "Low stock", className: "low" };
  }

  return { label: "In stock", className: "available" };
};

const AdminProductTable = ({
  products = [],
  isLoading,
  actionLoading,
  onToggleStatus,
}) => {
  if (isLoading && products.length === 0) {
    return (
      <div className="admin-products__state" role="status">
        <LoaderCircle size={28} className="is-spinning" />
        <span>Loading products...</span>
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="admin-products__state">
        <Package size={34} />
        <strong>No products found</strong>
        <span>Try changing your search or filters.</span>
      </div>
    );
  }

  return (
    <div className="admin-products__table-wrap">
      <table className="admin-products__table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Inventory</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const stock = getStockStatus(product.stock);
            const isUpdating = actionLoading === product._id;

            return (
              <tr key={product._id}>
                <td>
                  <div className="admin-products__product">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <span className="admin-products__image-placeholder">
                        <Package size={19} />
                      </span>
                    )}

                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.slug}</span>
                    </div>
                  </div>
                </td>

                <td className="admin-products__sku">
                  {product.sku || "—"}
                </td>

                <td>{product.category || "Uncategorized"}</td>

                <td className="admin-products__price">
                  {formatCurrency(product.price)}
                </td>

                <td>
                  <span
                    className={`admin-products__stock admin-products__stock--${stock.className}`}
                  >
                    {stock.className === "out" && (
                      <AlertTriangle size={13} />
                    )}
                    {Number(product.stock) || 0} · {stock.label}
                  </span>
                </td>

                <td>
                  <span
                    className={`admin-products__status ${
                      product.isActive ? "is-active" : "is-inactive"
                    }`}
                  >
                    <span />
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td>
                  <div className="admin-products__actions">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="admin-products__edit"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit3 size={15} />
                      <span>Edit</span>
                    </Link>

                    <button
                      type="button"
                      className={`admin-products__action ${
                        product.isActive
                          ? "is-deactivate"
                          : "is-activate"
                      }`}
                      onClick={() => onToggleStatus(product)}
                      disabled={Boolean(actionLoading)}
                      aria-busy={isUpdating}
                    >
                      {isUpdating ? (
                        <LoaderCircle
                          size={15}
                          className="is-spinning"
                        />
                      ) : product.isActive ? (
                        <PowerOff size={15} />
                      ) : (
                        <Power size={15} />
                      )}

                      <span>
                        {product.isActive ? "Deactivate" : "Activate"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductTable;
