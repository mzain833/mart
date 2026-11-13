
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function WishlistItem({
  product,
  onRemove,
  onAddToCart,
}) {
  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <article className="wishlist-item">
      <Link
        to={`/product/${product.slug}`}
        className="wishlist-item__image-link"
      >
        <img
          src={product.image}
          alt={product.name}
          className="wishlist-item__image"
          loading="lazy"
        />
      </Link>

      <div className="wishlist-item__content">
        <span className="wishlist-item__category">
          {product.category}
        </span>

        <Link
          to={`/product/${product.slug}`}
          className="wishlist-item__name"
        >
          {product.name}
        </Link>

        <strong className="wishlist-item__price">
          {formatPrice(product.price)}
        </strong>

        <span
          className={
            isOutOfStock
              ? "wishlist-item__stock is-out"
              : "wishlist-item__stock"
          }
        >
          {isOutOfStock ? "Out of stock" : "In stock"}
        </span>

        <div className="wishlist-item__actions">
          <button
            type="button"
            className="wishlist-item__add"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
          >
            <ShoppingBag size={16} />
            Add to Cart
          </button>

          <button
            type="button"
            className="wishlist-item__remove"
            aria-label={`Remove ${product.name} from wishlist`}
            onClick={() => onRemove(product.id)}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <Heart
        className="wishlist-item__heart"
        size={19}
        fill="currentColor"
      />
    </article>
  );
}
