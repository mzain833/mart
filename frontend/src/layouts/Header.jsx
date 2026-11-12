
// import { useState } from "react";
// import {
//   Search,
//   UserRound,
//   Heart,
//   ShoppingBag,
// } from "lucide-react";

// export default function Header() {
//   const [searchQuery, setSearchQuery] = useState("");

//   function handleSearch(event) {
//     event.preventDefault();

//     const query = searchQuery.trim();

//     if (!query) return;

//     window.location.href = `/shop?search=${encodeURIComponent(query)}`;
//   }

//   return (
//     <header className="site-header">
//       <div className="header-inner">

//         <a href="/" className="brand" aria-label="NexaMart home">
//           <span className="brand-mark">N</span>

//           <span className="brand-name">
//             Nexa<span>Mart</span>
//           </span>
//         </a>

//         <form
//           className="header-search"
//           role="search"
//           onSubmit={handleSearch}
//         >
//           <Search size={19} className="search-icon" />

//           <input
//             type="search"
//             name="search"
//             value={searchQuery}
//             onChange={(event) =>
//               setSearchQuery(event.target.value)
//             }
//             placeholder="Search products, brands and more..."
//             aria-label="Search products"
//           />

//           <button type="submit" aria-label="Submit search">
//             <Search size={18} />
//           </button>
//         </form>

//         <div className="header-actions">

//           <a href="/account" className="header-action">
//             <UserRound size={20} />
//             <span>Account</span>
//           </a>

//           <a href="/wishlist" className="header-action">
//             <Heart size={20} />
//             <span>Wishlist</span>
//           </a>

//           <a href="/cart" className="header-action">
//             <ShoppingBag size={20} />
//             <span>Cart</span>
//           </a>

//         </div>
//       </div>
//     </header>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
} from "lucide-react";

import useShopStore from "../store/useShopStore";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const cartCount = useShopStore((state) =>
    state.cartItems.reduce((total, item) => total + item.quantity, 0)
  );

  const wishlistCount = useShopStore(
    (state) => state.wishlistItems.length
  );

  function handleSearch(event) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate(`/shop?search=${encodeURIComponent(query)}`);
  }

  return (
    <header className="site-header">
      <div className="header-inner">

        <a href="/" className="brand" aria-label="NexaMart home">
          <span className="brand-mark">N</span>

          <span className="brand-name">
            Nexa<span>Mart</span>
          </span>
        </a>

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
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search products, brands and more..."
            aria-label="Search products"
          />

          <button type="submit" aria-label="Submit search">
            <Search size={18} />
          </button>
        </form>

        <div className="header-actions">

          <a href="/account" className="header-action">
            <UserRound size={20} />
            <span>Account</span>
          </a>

          <a href="/wishlist" className="header-action">
            <span className="header-icon-wrapper">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="header-count">
                  {wishlistCount}
                </span>
              )}
            </span>
            <span>Wishlist</span>
          </a>

          <a href="/cart" className="header-action">
            <span className="header-icon-wrapper">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="header-count">
                  {cartCount}
                </span>
              )}
            </span>
            <span>Cart</span>
          </a>

        </div>
      </div>
    </header>
  );
}
