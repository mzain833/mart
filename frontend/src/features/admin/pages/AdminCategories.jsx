
import {
  AlertTriangle,
  ArrowLeft,
  Edit3,
  FolderOpen,
  LoaderCircle,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import useAdminCategories from "../hooks/useAdminCategories";

import "./admin-categories.css";

const AdminCategories = () => {
  const {
    categories,
    isLoading,
    actionLoading,
    error,
    refreshCategories,
    toggleCategoryStatus,
  } = useAdminCategories();

  const activeCount = categories.filter(
    (category) => category.isActive
  ).length;

  return (
    <main className="admin-categories">
      <div className="admin-categories__container">
        <header className="admin-categories__header">
          <div>
            <Link to="/admin" className="admin-categories__back">
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>

            <span className="admin-categories__eyebrow">
              NEXAMART ADMINISTRATION
            </span>

            <h1>Category Management</h1>

            <p>
              Organize your catalog and manage product categories.
            </p>
          </div>

          <div className="admin-categories__header-actions">
            <div className="admin-categories__security">
              <ShieldCheck size={17} />
              Authorized Administrator
            </div>

            <button
              type="button"
              className="admin-categories__refresh"
              onClick={refreshCategories}
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "is-spinning" : ""}
              />
              Refresh
            </button>

            <Link
              to="/admin/categories/new"
              className="admin-categories__add"
            >
              <Plus size={17} />
              Add Category
            </Link>
          </div>
        </header>

        <section className="admin-categories__overview">
          <div>
            <span>Total categories</span>
            <strong>{categories.length}</strong>
          </div>

          <div>
            <span>Active categories</span>
            <strong>{activeCount}</strong>
          </div>

          <div>
            <span>Inactive categories</span>
            <strong>{categories.length - activeCount}</strong>
          </div>
        </section>

        <section className="admin-categories__panel">
          <div className="admin-categories__panel-heading">
            <div>
              <h2>Store Categories</h2>
              <p>Manage category information and visibility.</p>
            </div>

            <FolderOpen size={21} />
          </div>

          {error && (
            <div className="admin-categories__error" role="alert">
              <AlertTriangle size={18} />
              <span>{error}</span>

              <button type="button" onClick={refreshCategories}>
                Try again
              </button>
            </div>
          )}

          {isLoading && categories.length === 0 ? (
            <div className="admin-categories__state">
              <LoaderCircle className="is-spinning" size={28} />
              <span>Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="admin-categories__state">
              <FolderOpen size={34} />
              <strong>No categories found</strong>
              <span>Create your first store category.</span>

              <Link to="/admin/categories/new">
                <Plus size={16} />
                Create Category
              </Link>
            </div>
          ) : (
            <div className="admin-categories__table-wrap">
              <table className="admin-categories__table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => {
                    const isUpdating = actionLoading === category._id;

                    return (
                      <tr key={category._id}>
                        <td>
                          <div className="admin-categories__category">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                loading="lazy"
                              />
                            ) : (
                              <div className="admin-categories__placeholder">
                                <FolderOpen size={20} />
                              </div>
                            )}

                            <strong>{category.name}</strong>
                          </div>
                        </td>

                        <td className="admin-categories__slug">
                          {category.slug}
                        </td>

                        <td className="admin-categories__description">
                          {category.description || "—"}
                        </td>

                        <td>
                          <span
                            className={`admin-categories__status ${
                              category.isActive
                                ? "is-active"
                                : "is-inactive"
                            }`}
                          >
                            <span />
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        
<td>
  <div className="admin-categories__actions">
    <Link
      to={`/admin/categories/${category._id}/edit`}
      className="admin-categories__edit"
    >
      <Edit3 size={15} />
      <span>Edit</span>
    </Link>

    <button
      type="button"
      className={`admin-categories__action ${
        category.isActive
          ? "is-deactivate"
          : "is-activate"
      }`}
      onClick={() => toggleCategoryStatus(category)}
      disabled={Boolean(actionLoading)}
      aria-busy={isUpdating}
    >
      {isUpdating ? (
        <LoaderCircle size={15} className="is-spinning" />
      ) : category.isActive ? (
        <PowerOff size={15} />
      ) : (
        <Power size={15} />
      )}

      <span>
        {category.isActive ? "Deactivate" : "Activate"}
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
          )}
        </section>

        <footer className="admin-categories__footer">
          <FolderOpen size={16} />
          <span>NexaMart secure category management workspace</span>
        </footer>
      </div>
    </main>
  );
};

export default AdminCategories;
