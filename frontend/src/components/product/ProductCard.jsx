
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { formatPrice, getDiscountPercentage } from "../../features/products/utils/productUtils";

function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) {
  const {
    name,
    slug,
    image,
    price,
    compareAtPrice,
    rating,
    reviewCount,
    badge,
    stock,
  } = product;

  const discount = getDiscountPercentage(price, compareAtPrice);

  return (
    <article className="product-card">

      <div className="product-card-image">
        <Link
          to={`/product/${slug}`}
          aria-label={`View ${name}`}
        >
          <img
            src={image}
            alt={name}
            loading="lazy"
          />
        </Link>

        {badge && (
          <span className="product-card-badge">
            {badge}
          </span>
        )}

        {discount > 0 && (
          <span className="product-discount">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          className={`product-wishlist ${isWishlisted ? "is-active" : ""}`}
          onClick={() => onToggleWishlist?.(product)}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={isWishlisted}
        >
          <Heart
            size={19}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="product-card-content">

        <span className="product-category">
          {product.category}
        </span>

        <Link
          to={`/product/${slug}`}
          className="product-name"
        >
          {name}
        </Link>

        <div className="product-rating">
          <Star
            size={14}
            fill="currentColor"
          />

          <span>{rating.toFixed(1)}</span>

          <span className="product-review-count">
            ({reviewCount})
          </span>
        </div>

        <div className="product-pricing">
          <strong>{formatPrice(price)}</strong>

          {compareAtPrice > price && (
            <del>{formatPrice(compareAtPrice)}</del>
          )}
        </div>

        <button
          type="button"
          className="product-add-button"
          onClick={() => onAddToCart?.(product)}
          disabled={stock <= 0}
        >
          <ShoppingBag size={17} />

          {stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>

      </div>
    </article>
  );
}

export default ProductCard;
