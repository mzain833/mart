
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

import MainLayout from "../../../layouts/MainLayout";
import useShopStore from "../../../store/useShopStore";
import useProducts from "../../products/hooks/useproducts";

import WishlistItem from "../components/WishlistItem";

import "../wishlist.css";

export default function WishlistPage() {
  const wishlistItems = useShopStore(
    (state) => state.wishlistItems
  );

  const toggleWishlist = useShopStore(
    (state) => state.toggleWishlist
  );

  const addToCart = useShopStore(
    (state) => state.addToCart
  );

  const {
    products = [],
    isLoading,
    error,
  } = useProducts({});

  const wishlistProducts = products.filter((product) =>
    wishlistItems.includes(product.id)
  );

  return (
    <MainLayout>
      <section className="wishlist-page">
        <div className="wishlist-page__container">
          <header className="wishlist-page__heading">
            <span className="wishlist-page__eyebrow">
              YOUR PERSONAL COLLECTION
            </span>

            <h1>My Wishlist</h1>

            <p>
              Your favorite products, all in one place.
            </p>
          </header>

          {isLoading ? (
            <div className="wishlist-message">
              Loading your favorites...
            </div>
          ) : error ? (
            <div className="wishlist-message wishlist-message--error">
              Unable to load products. Please try again.
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty__icon">
                <Heart size={34} />
              </div>

              <h2>Your wishlist is waiting</h2>

              <p>
                Save products you love and find them here anytime.
              </p>

              <Link
                to="/shop"
                className="wishlist-empty__button"
              >
                Discover Products
              </Link>
            </div>
          ) : (
            <>
              <div className="wishlist-page__toolbar">
                <h2>Saved Products</h2>
                <span>
                  {wishlistProducts.length} products
                </span>
              </div>

              <div className="wishlist-grid">
                {wishlistProducts.map((product) => (
                  <WishlistItem
                    key={product.id}
                    product={product}
                    onRemove={toggleWishlist}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
