
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  LoaderCircle,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import adminCategoryService from "../services/adminCategoryService";

import "./admin-categories.css";

const INITIAL_FORM = {
  name: "",
  slug: "",
  description: "",
  image: "",
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong. Please try again.";

const AdminCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return undefined;

    const controller = new AbortController();

    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const categories = await adminCategoryService.getCategories({
          signal: controller.signal,
        });

        const category = categories.find(
          (item) => item._id === id
        );

        if (!category) {
          throw new Error("Requested category nahi mili.");
        }

        setForm({
          name: category.name ?? "",
          slug: category.slug ?? "",
          description: category.description ?? "",
          image: category.image ?? "",
        });

        setSlugTouched(true);
      } catch (requestError) {
        if (
          requestError.code === "ERR_CANCELED" ||
          controller.signal.aborted
        ) {
          return;
        }

        setError(getErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadCategory();

    return () => controller.abort();
  }, [id, isEditMode]);

  const updateField = (name, value) => {
    setForm((current) => {
      const updated = { ...current, [name]: value };

      if (name === "name" && !slugTouched) {
        updated.slug = slugify(value);
      }

      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      image: form.image.trim() || null,
    };

    if (!payload.name || !payload.slug) {
      setError("Category name aur slug required hain.");
      return;
    }

    try {
      setSaving(true);

      if (isEditMode) {
        await adminCategoryService.updateCategory(id, payload);
      } else {
        await adminCategoryService.createCategory(payload);
      }

      navigate("/admin/categories", {
        replace: true,
        state: {
          message: isEditMode
            ? "Category updated successfully."
            : "Category created successfully.",
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="admin-category-form">
        <div className="admin-category-form__state">
          <LoaderCircle className="is-spinning" size={28} />
          <span>Loading category...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-category-form">
      <div className="admin-category-form__container">
        <header className="admin-category-form__header">
          <div>
            <Link
              to="/admin/categories"
              className="admin-category-form__back"
            >
              <ArrowLeft size={16} />
              Back to categories
            </Link>

            <span className="admin-category-form__eyebrow">
              NEXAMART ADMINISTRATION
            </span>

            <h1>{isEditMode ? "Edit Category" : "Create Category"}</h1>

            <p>
              {isEditMode
                ? "Update your category information."
                : "Add a new category to your store catalog."}
            </p>
          </div>

          <div className="admin-category-form__security">
            <ShieldCheck size={17} />
            Authorized Administrator
          </div>
        </header>

        {error && (
          <div className="admin-category-form__error" role="alert">
            {error}
          </div>
        )}

        <form
          className="admin-category-form__panel"
          onSubmit={handleSubmit}
        >
          <div className="admin-category-form__section-heading">
            <h2>Category Information</h2>
            <p>Enter the details used in your store catalog.</p>
          </div>

          <div className="admin-category-form__grid">
            <label className="admin-category-form__field">
              <span>Category Name *</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                minLength={2}
                maxLength={80}
                required
                disabled={saving}
                placeholder="e.g. Men Shoes"
              />
            </label>

            <label className="admin-category-form__field">
              <span>Category Slug *</span>
              <input
                type="text"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateField("slug", slugify(event.target.value));
                }}
                minLength={2}
                maxLength={100}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
                disabled={saving}
                placeholder="men-shoes"
              />
              <small>Category URL identifier.</small>
            </label>
          </div>

          <label className="admin-category-form__field">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              maxLength={500}
              rows={5}
              disabled={saving}
              placeholder="Write a short category description..."
            />
            <small>{form.description.length}/500 characters</small>
          </label>

          <label className="admin-category-form__field">
            <span>Category Image URL</span>
            <input
              type="url"
              value={form.image}
              onChange={(event) =>
                updateField("image", event.target.value)
              }
              maxLength={2048}
              disabled={saving}
              placeholder="https://example.com/category-image.jpg"
            />
            <small>
              Secure HTTPS image URL use karein.
            </small>
          </label>

          {form.image && (
            <div className="admin-category-form__preview">
              <img
                src={form.image}
                alt="Category preview"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <span>
                <ImageIcon size={15} />
                Image preview
              </span>
            </div>
          )}

          <div className="admin-category-form__actions">
            <Link
              to="/admin/categories"
              className="admin-category-form__cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-category-form__submit"
              disabled={saving}
            >
              {saving ? (
                <LoaderCircle size={17} className="is-spinning" />
              ) : (
                <Save size={17} />
              )}

              {saving
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AdminCategoryForm;
