
import ProductCard from "../../../components/product/ProductCard";

export default function ProductGrid({
  products,
  onAddToCart,
  onToggleWishlist,
  wishlistItems = [],
}) {
  if (!products.length) {
    return (
      <div className="product-empty-state">
        <h3>No products found</h3>

        <p>
          Aapki selected filters ke mutabiq products available nahi hain.
          Filters change karke dobara try karein.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistItems.includes(product.id)}
        />
      ))}
    </div>
  );
}
