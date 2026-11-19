
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  LoaderCircle,
  Save,
  ShieldCheck,
  Upload,
  X,
  Star,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import adminProductService from "../services/adminProductService";

import "./admin-product-form.css";

const INITIAL_FORM = {
  sku: "",
  slug: "",
  name: "",
  category: "",
  price: "",
  compareAtPrice: "",
  badge: "",
  description: "",
  stock: "0",
  isNewArrival: false,
  bestSeller: false,
  isActive: true,
};

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

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

const createImageId = (file, index) =>
  `${Date.now()}-${index}-${file.name}`;

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef(new Set());

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [mainImageId, setMainImageId] = useState(null);

  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      objectUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!isEditMode) return undefined;

    const controller = new AbortController();

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const product = await adminProductService.getProductById(
          id,
          { signal: controller.signal }
        );

        setForm({
          sku: product.sku ?? "",
          slug: product.slug ?? "",
          name: product.name ?? "",
          category: product.category ?? "",
          price: String(product.price ?? ""),
          compareAtPrice:
            product.compareAtPrice == null
              ? ""
              : String(product.compareAtPrice),
          badge: product.badge ?? "",
          description: product.description ?? "",
          stock: String(product.stock ?? 0),
          isNewArrival: Boolean(product.isNewArrival),
          bestSeller: Boolean(product.bestSeller),
          isActive: Boolean(product.isActive),
        });

        const existingImages = Array.isArray(product.images)
          ? product.images.map((image, index) => ({
              id: image.publicId || `existing-${index}`,
              url: image.url,
              publicId: image.publicId,
              file: null,
              previewUrl: image.url,
              isExisting: true,
            }))
          : [];

        const initialImages = existingImages.length
          ? existingImages
          : product.image
            ? [
                {
                  id: "legacy-image",
                  url: product.image,
                  publicId: null,
                  file: null,
                  previewUrl: product.image,
                  isExisting: true,
                  isLegacy: true,
                },
              ]
            : [];

        setImages(initialImages);
        setMainImageId(initialImages[0]?.id ?? null);
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

    loadProduct();

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

  const releaseImagePreview = (url) => {
    if (!url || !objectUrlsRef.current.has(url)) return;

    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  };

  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    // Same file ko dobara select karne ki permission.
    event.target.value = "";

    if (!selectedFiles.length) return;

    setError("");

    const availableSlots = MAX_IMAGES - images.length;

    if (availableSlots <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed hain.`);
      return;
    }

    const acceptedFiles = [];
    const validationErrors = [];

    selectedFiles.forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        validationErrors.push(
          `${file.name}: Unsupported image format.`
        );
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        validationErrors.push(
          `${file.name}: Image size 5MB se zyada hai.`
        );
        return;
      }

      acceptedFiles.push(file);
    });

    const filesToAdd = acceptedFiles.slice(0, availableSlots);

    if (acceptedFiles.length > availableSlots) {
      validationErrors.push(
        `Sirf ${availableSlots} additional images add ho sakti hain.`
      );
    }

    if (validationErrors.length) {
      setError(validationErrors.join(" "));
    }

    if (!filesToAdd.length) return;

    const newImages = filesToAdd.map((file, index) => {
      const previewUrl = URL.createObjectURL(file);

      objectUrlsRef.current.add(previewUrl);

      return {
        id: createImageId(file, index),
        url: "",
        publicId: null,
        file,
        previewUrl,
        isExisting: false,
      };
    });

    if (!images.some((image) => !image.isLegacy)) {
  setMainImageId(newImages[0].id);
}

setImages((current) => [...current, ...newImages]);
  };

  const handleRemoveImage = (imageId) => {
    const targetImage = images.find(
      (image) => image.id === imageId
    );

    if (!targetImage) return;

    releaseImagePreview(targetImage.previewUrl);

    const updatedImages = images.filter(
      (image) => image.id !== imageId
    );

    setImages(updatedImages);

    if (mainImageId === imageId) {
      setMainImageId(updatedImages[0]?.id ?? null);
    }
  };

  const handleSetMainImage = (imageId) => {
    const targetImage = images.find(
      (image) => image.id === imageId
    );

    if (!targetImage) return;

    // Legacy URL ko Cloudinary image ke saath primary
    // banane se backend ka first-image rule conflict karega.
    if (
      targetImage.isLegacy &&
      images.some((image) => !image.isLegacy)
    ) {
      setError(
        "Cloudinary images mein se main image select karein."
      );
      return;
    }

    setMainImageId(imageId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

   const mainImage =
  images.find((image) => image.id === mainImageId) ??
  images[0] ??
  null;

if (!mainImage) {
  setError("Kam az kam aik product image select karein.");
  return;
}

if (mainImage.id !== mainImageId) {
  setMainImageId(mainImage.id);
}

    const payload = {
      ...form,
      sku: form.sku.trim().toUpperCase(),
      slug: form.slug.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      compareAtPrice:
        form.compareAtPrice.trim() === ""
          ? null
          : Number(form.compareAtPrice),
      badge: form.badge.trim() || null,
      description: form.description.trim(),
      stock: Number(form.stock),
      isNewArrival: Boolean(form.isNewArrival),
      bestSeller: Boolean(form.bestSeller),
      isActive: Boolean(form.isActive),
    };

    if (
      !Number.isFinite(payload.price) ||
      payload.price < 0 ||
      !Number.isInteger(payload.stock) ||
      payload.stock < 0
    ) {
      setError(
        "Price aur stock valid non-negative numbers hone chahiye."
      );
      return;
    }

    if (
      payload.compareAtPrice !== null &&
      (!Number.isFinite(payload.compareAtPrice) ||
        payload.compareAtPrice <= payload.price)
    ) {
      setError(
        "Compare-at price selling price se zyada honi chahiye."
      );
      return;
    }

    try {
      setSaving(true);

      const newImages = images.filter(
        (image) => image.file
      );

      let uploadedImages = [];

      if (newImages.length) {
        uploadedImages =
          await adminProductService.uploadProductImages(
            newImages.map((image) => image.file)
          );
      }

      let uploadIndex = 0;

      const resolvedImages = images.map((image) => {
        if (!image.file) return image;

        const uploadedImage = uploadedImages[uploadIndex];

        uploadIndex += 1;

        if (!uploadedImage?.url || !uploadedImage?.publicId) {
          throw new Error(
            "Image upload response invalid hai. Dobara try karein."
          );
        }

        return {
          ...image,
          url: uploadedImage.url,
          publicId: uploadedImage.publicId,
        };
      });

      const orderedImages = [
        ...resolvedImages.filter(
          (image) => image.id === mainImageId
        ),
        ...resolvedImages.filter(
          (image) => image.id !== mainImageId
        ),
      ];

      const primaryImage = orderedImages[0];

      payload.image = primaryImage.url;

      const cloudinaryImages = orderedImages
        .filter((image) => image.publicId)
        .map(({ url, publicId }) => ({
          url,
          publicId,
        }));

      payload.images = cloudinaryImages;

      if (isEditMode) {
        delete payload.sku;

        await adminProductService.updateProduct(
          id,
          payload
        );
      } else {
        await adminProductService.createProduct(payload);
      }

      navigate("/admin/products", {
        replace: true,
        state: {
          message: isEditMode
            ? "Product updated successfully."
            : "Product created successfully.",
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
      <main className="admin-product-form">
        <div className="admin-product-form__state">
          <LoaderCircle className="is-spinning" size={28} />
          <span>Loading product details...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-product-form">
      <div className="admin-product-form__container">
        <header className="admin-product-form__header">
          <div>
            <Link
              to="/admin/products"
              className="admin-product-form__back"
            >
              <ArrowLeft size={16} />
              Back to products
            </Link>

            <span className="admin-product-form__eyebrow">
              NEXAMART ADMINISTRATION
            </span>

            <h1>
              {isEditMode ? "Edit Product" : "Create Product"}
            </h1>

            <p>
              {isEditMode
                ? "Update your product information and catalog settings."
                : "Add a new product to your NexaMart catalog."}
            </p>
          </div>

          <div className="admin-product-form__security">
            <ShieldCheck size={17} />
            Authorized Administrator
          </div>
        </header>

        {error && (
          <div className="admin-product-form__error" role="alert">
            {error}
          </div>
        )}

        <form
          className="admin-product-form__layout"
          onSubmit={handleSubmit}
        >
          <section className="admin-product-form__panel">
            <div className="admin-product-form__section-heading">
              <h2>Product Information</h2>
              <p>Basic details displayed in your store catalog.</p>
            </div>

            <div className="admin-product-form__grid">
              <label className="admin-product-form__field">
                <span>Product Name *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  minLength={2}
                  maxLength={160}
                  required
                  placeholder="Enter product name"
                />
              </label>

              <label className="admin-product-form__field">
                <span>SKU *</span>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(event) =>
                    updateField(
                      "sku",
                      event.target.value.toUpperCase()
                    )
                  }
                  minLength={3}
                  maxLength={40}
                  required
                  readOnly={isEditMode}
                  placeholder="e.g. NM-009"
                />
                {isEditMode && (
                  <small>SKU cannot be changed after creation.</small>
                )}
              </label>

              <label className="admin-product-form__field">
                <span>Product Slug *</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField("slug", slugify(event.target.value));
                  }}
                  minLength={3}
                  maxLength={180}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  required
                  placeholder="product-url-slug"
                />
                <small>Used in the product URL.</small>
              </label>

              <label className="admin-product-form__field">
                <span>Category *</span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  minLength={2}
                  maxLength={80}
                  required
                  placeholder="e.g. Electronics"
                />
              </label>

              <label className="admin-product-form__field">
                <span>Badge</span>
                <input
                  type="text"
                  value={form.badge}
                  onChange={(event) =>
                    updateField("badge", event.target.value)
                  }
                  maxLength={60}
                  placeholder="e.g. Best Value"
                />
              </label>
            </div>

            <label className="admin-product-form__field admin-product-form__description">
              <span>Description *</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                minLength={10}
                maxLength={3000}
                rows={6}
                required
                placeholder="Write a detailed product description..."
              />
              <small>
                {form.description.length}/3000 characters
              </small>
            </label>
          </section>

          <section className="admin-product-form__panel">
            <div className="admin-product-form__section-heading">
              <h2>Product Images</h2>
              <p>
                Computer se images select karein. Main image
                storefront par primary image hogi.
              </p>
            </div>

            <div className="admin-product-form__upload">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                hidden
                onChange={handleImageSelection}
              />

              <button
                type="button"
                className="admin-product-form__upload-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving || images.length >= MAX_IMAGES}
              >
                <Upload size={19} />
                <span>
                  {images.length >= MAX_IMAGES
                    ? "Image limit reached"
                    : "Choose images from computer"}
                </span>
              </button>

              <p className="admin-product-form__upload-hint">
                JPEG, PNG, WEBP, AVIF · Maximum 5MB each ·
                Maximum 8 images
              </p>
            </div>

            <div className="admin-product-form__image-count">
              <span>Selected images</span>
              <strong>
                {images.length}/{MAX_IMAGES}
              </strong>
            </div>

            {images.length ? (
              <div className="admin-product-form__image-grid">
                {images.map((image) => {
                  const isMain = image.id === mainImageId;

                  return (
                    <article
                      className={`admin-product-form__image-card ${
                        isMain ? "is-main" : ""
                      }`}
                      key={image.id}
                    >
                      <div className="admin-product-form__image-frame">
                        <img
                          src={image.previewUrl}
                          alt="Product"
                        />

                        {isMain && (
                          <span className="admin-product-form__main-badge">
                            <Star size={12} fill="currentColor" />
                            Main Image
                          </span>
                        )}

                        <button
                          type="button"
                          className="admin-product-form__image-remove"
                          onClick={() => handleRemoveImage(image.id)}
                          disabled={saving}
                          aria-label="Remove image"
                          title="Remove image"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="admin-product-form__image-meta">
                        {!isMain && (
                          <button
                            type="button"
                            className="admin-product-form__main-action"
                            onClick={() =>
                              handleSetMainImage(image.id)
                            }
                            disabled={saving}
                          >
                            Set as main
                          </button>
                        )}

                        {image.file && (
                          <small>
                            {(image.file.size / (1024 * 1024)).toFixed(2)} MB
                          </small>
                        )}

                        {image.isLegacy && (
                          <small>Existing legacy image</small>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="admin-product-form__empty-images">
                <ImageIcon size={34} />
                <span>No product images selected.</span>
                <small>At least one image is required.</small>
              </div>
            )}
          </section>

          <section className="admin-product-form__panel">
            <div className="admin-product-form__section-heading">
              <h2>Pricing & Inventory</h2>
              <p>Configure product pricing and stock availability.</p>
            </div>

            <div className="admin-product-form__grid">
              <label className="admin-product-form__field">
                <span>Selling Price (PKR) *</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    updateField("price", event.target.value)
                  }
                  required
                  placeholder="0"
                />
              </label>

              <label className="admin-product-form__field">
                <span>Compare-at Price (PKR)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={(event) =>
                    updateField("compareAtPrice", event.target.value)
                  }
                  placeholder="Optional"
                />
                <small>Must be higher than selling price.</small>
              </label>

              <label className="admin-product-form__field">
                <span>Stock Quantity *</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    updateField("stock", event.target.value)
                  }
                  required
                />
              </label>
            </div>
          </section>

          <section className="admin-product-form__panel">
            <div className="admin-product-form__section-heading">
              <h2>Catalog Settings</h2>
              <p>Control product visibility and merchandising.</p>
            </div>

            <div className="admin-product-form__toggles">
              <label>
                <input
                  type="checkbox"
                  checked={form.isNewArrival}
                  onChange={(event) =>
                    updateField("isNewArrival", event.target.checked)
                  }
                />
                <span>
                  <strong>New Arrival</strong>
                  <small>Display this product in new arrivals.</small>
                </span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.bestSeller}
                  onChange={(event) =>
                    updateField("bestSeller", event.target.checked)
                  }
                />
                <span>
                  <strong>Best Seller</strong>
                  <small>Mark this product as a best seller.</small>
                </span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                />
                <span>
                  <strong>Active Product</strong>
                  <small>Make this product available in the store.</small>
                </span>
              </label>
            </div>
          </section>

          <div className="admin-product-form__actions">
            <Link
              to="/admin/products"
              className="admin-product-form__cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-product-form__submit"
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
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AdminProductForm;
