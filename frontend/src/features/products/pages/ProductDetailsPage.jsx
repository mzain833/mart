
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate  } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import { productService } from "../services/productService";
import useShopStore from "../../../store/useShopStore";
import {
  formatPrice,
  getDiscountPercentage,
} from "../utils/productUtils";

import "../products.css";

export default function ProductDetailsPage() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const wishlistItems = useShopStore((state) => state.wishlistItems);
const navigate = useNavigate();
  const isWishlisted = product
    ? wishlistItems.includes(product.id)
    : false;

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setQuantity(1);

      try {
        const result = await productService.getProductBySlug(slug);

        if (isMounted) {
          setProduct(result);
        }
      } catch {
        if (isMounted) {
          setProduct(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="product-loading">
          Loading product details...
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="product-empty-state">
          <h3>Product not found</h3>
          <p>This product may no longer be available.</p>
          <Link to="/shop" className="product-primary-button">
            Back to Shop
          </Link>
        </div>
      </MainLayout>
    );
  }

  const discount = getDiscountPercentage(
    product.price,
    product.compareAtPrice
  );

  return (
    <MainLayout>
      <section className="product-details-page">

        <div className="details-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-details-grid">

          <div className="details-image-wrapper">
            {product.badge && (
              <span className="details-badge">
                {product.badge}
              </span>
            )}

            <img
              src={product.image}
              alt={product.name}
              className="details-main-image"
            />
          </div>

          <div className="details-information">

            <span className="details-category">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <div className="details-rating">
              <Star size={17} fill="currentColor" />
            <strong>{Number(product.rating ?? 0).toFixed(1)}</strong>
              <span>
                ({product.reviewCount} customer reviews)
              </span>
            </div>

            <div className="details-price">
              <strong>{formatPrice(product.price)}</strong>

              {product.compareAtPrice > product.price && (
                <>
                  <del>{formatPrice(product.compareAtPrice)}</del>
                  <span>{discount}% OFF</span>
                </>
              )}
            </div>

            <p className="details-description">
              {product.description}
            </p>

            <div className="details-stock">
              <span
                className={
                  product.stock > 0
                    ? "stock-available"
                    : "stock-unavailable"
                }
              >
                {product.stock > 0
                  ? "In Stock"
                  : "Currently Unavailable"}
              </span>
            </div>

            {product.stock > 0 && (
              <>
                <div className="details-quantity">
                  <span>Quantity</span>

                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) => Math.max(1, value - 1))
                      }
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) =>
                          Math.min(product.stock, value + 1)
                        )
                      }
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="details-add-button"
                  onClick={() => {
  addToCart(product, quantity);
  navigate("/cart");
}}
                >
                  <ShoppingBag size={19} />
                  Add to Cart
                </button>
              </>
            )}

            <button
              type="button"
              className={`details-wishlist-button ${
                isWishlisted ? "is-active" : ""
              }`}
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart
                size={18}
                fill={isWishlisted ? "currentColor" : "none"}
              />

              {isWishlisted
                ? "Remove from Wishlist"
                : "Add to Wishlist"}
            </button>

            <div className="details-trust-note">
              <ArrowLeft size={15} />
              <Link to="/shop">Continue exploring our collection</Link>
            </div>

          </div>
        </div>
      </section>
    </MainLayout>
  );
}
