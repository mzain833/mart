
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
} from "lucide-react";

import useShopStore from "../store/useShopStore";
import useAccount from "../features/account/hooks/useAccount";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const { currentUser, isAuthenticated } = useAccount();

  const cartCount = useShopStore((state) =>
    state.cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    )
  );

  const wishlistCount = useShopStore(
    (state) => state.wishlistItems.length
  );

  const accountLabel = isAuthenticated
    ? currentUser?.fullName?.split(" ")[0] || "My Account"
    : "Sign In";

  function handleSearch(event) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setSearchQuery("");
  }

  return (
    <header className="site-header">
      <div className="header-inner">

        <Link
          to="/"
          className="brand"
          aria-label="NexaMart home"
        >
          <span className="brand-mark">N</span>

          <span className="brand-name">
            Nexa<span>Mart</span>
          </span>
        </Link>

        <form
          className="header-search"
          role="search"
          onSubmit={handleSearch}
        >
          <Search size={19} className="search-icon" />

          <input
            type="search"
            name="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search products, brands and more..."
            aria-label="Search products"
          />

          <button
            type="submit"
            aria-label="Submit search"
          >
            <Search size={18} />
          </button>
        </form>

        <div className="header-actions">

          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className="header-action"
            aria-label={accountLabel}
          >
            <UserRound size={20} />
            <span>{accountLabel}</span>
          </Link>

          <Link
            to="/wishlist"
            className="header-action"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <span className="header-icon-wrapper">
              <Heart size={20} />

              {wishlistCount > 0 && (
                <span className="header-count">
                  {wishlistCount}
                </span>
              )}
            </span>

            <span>Wishlist</span>
          </Link>

          <Link
            to="/cart"
            className="header-action"
            aria-label={`Cart, ${cartCount} items`}
          >
            <span className="header-icon-wrapper">
              <ShoppingBag size={20} />

              {cartCount > 0 && (
                <span className="header-count">
                  {cartCount}
                </span>
              )}
            </span>

            <span>Cart</span>
          </Link>

        </div>
      </div>
    </header>
  );
}
