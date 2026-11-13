
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}) {
  const { product, quantity } = item;

  return (
    <article className="cart-item">
      <Link
        to={`/product/${product.slug}`}
        className="cart-item__image-link"
      >
        <img
          src={product.image}
          alt={product.name}
          className="cart-item__image"
          loading="lazy"
        />
      </Link>

      <div className="cart-item__details">
        <div>
          <span className="cart-item__category">
            {product.category}
          </span>

          <Link
            to={`/product/${product.slug}`}
            className="cart-item__name"
          >
            {product.name}
          </Link>

          <p className="cart-item__price">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="cart-item__actions">
          <div
            className="quantity-control"
            aria-label={`Quantity for ${product.name}`}
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() =>
                onUpdateQuantity(product.id, quantity - 1)
              }
            >
              <Minus size={15} />
            </button>

            <span aria-live="polite">{quantity}</span>

            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= product.stock}
              onClick={() =>
                onUpdateQuantity(product.id, quantity + 1)
              }
            >
              <Plus size={15} />
            </button>
          </div>

          <button
            type="button"
            className="cart-item__remove"
            onClick={() => onRemove(product.id)}
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>

      <div className="cart-item__total">
        {formatPrice(product.price * quantity)}
      </div>
    </article>
  );
}
