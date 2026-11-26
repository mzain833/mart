import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const NAVIGATION_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Contact", href: "/contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      className="site-navigation"
      aria-label="Main navigation"
    >
      <div className="navigation-inner">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
        >
          <span>Explore NexaMart</span>
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <ul
          id="primary-navigation"
          className={`navigation-list ${isOpen ? "is-open" : ""}`}
        >
          {NAVIGATION_ITEMS.map(({ label, href }) => (
            <li key={href}>
              <Link to={href} onClick={closeMenu}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <span className="navigation-caption">
          Curated for everyday living
          <ChevronDown size={13} />
        </span>
      </div>
    </nav>
  );
}