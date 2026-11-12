
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useProducts from "../hooks/useproducts";
import ProductGrid from "../components/ProductGrid";
import ProductFilters from "../components/ProductFilters";
import ProductToolbar from "../components/ProductToolbar";
import useShopStore from "../../../store/useShopStore";

import "../products.css";

export default function ShopPage({ collection: initialCollection = "all" }) {
  const [searchParams] = useSearchParams();

  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );

  const [maxPrice, setMaxPrice] = useState(100000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const collection =
    initialCollection !== "all"
      ? initialCollection
      : searchParams.get("collection") || "all";

  const {
    products,
    totalProducts,
    isLoading,
    error,
  } = useProducts({
    search,
    category,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy,
    collection,
  });

  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const wishlistItems = useShopStore((state) => state.wishlistItems);

  function clearFilters() {
    setCategory("all");
    setMaxPrice(100000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy("featured");
  }

  const pageTitle = {
    "new-arrivals": "New Arrivals",
    "best-sellers": "Best Sellers",
  }[collection] || "Discover Our Collection";

  return (
    <MainLayout>
      <div className="shop-page">

        <section className="shop-hero">
          <div className="shop-hero-content">

            <span className="shop-eyebrow">
              THE NEXAMART COLLECTION
            </span>

            <h1>{pageTitle}</h1>

            <p>
              Explore thoughtfully selected products,
              designed to bring more value to everyday living.
            </p>

            <div className="shop-breadcrumb">
              <a href="/">Home</a>
              <ArrowRight size={13} />
              <span>Shop</span>
            </div>

          </div>
        </section>

        <section className="shop-container">

          <div className="shop-section-heading">
            <div>
              <span className="shop-eyebrow">OUR SELECTION</span>
              <h2>Explore Products</h2>
            </div>

            <p>
              Quality products. Thoughtful choices.
            </p>
          </div>

          <div className="shop-layout">

            {isFilterOpen && (
              <button
                type="button"
                className="filter-backdrop"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
              />
            )}

            <div
              className={`shop-filter-sidebar ${
                isFilterOpen ? "is-open" : ""
              }`}
            >
              <ProductFilters
                category={category}
                onCategoryChange={setCategory}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                inStockOnly={inStockOnly}
                onInStockChange={setInStockOnly}
                onClear={clearFilters}
                onClose={() => setIsFilterOpen(false)}
              />
            </div>

            <div className="shop-products-area">

              <ProductToolbar
                total={products.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onFilterClick={() => setIsFilterOpen(true)}
              />

              {search && (
                <p className="shop-search-info">
                  Search results for: <strong>"{search}"</strong>
                </p>
              )}

              {isLoading ? (
                <div className="product-loading">
                  Loading our collection...
                </div>
              ) : error ? (
                <div className="product-empty-state">
                  <h3>Unable to load products</h3>
                  <p>{error}</p>
                </div>
              ) : (
                <ProductGrid
                  products={products}
                  onAddToCart={addToCart}
                  onToggleWishlist={(product) =>
                    toggleWishlist(product.id)
                  }
                  wishlistItems={wishlistItems}
                />
              )}

              {!isLoading && products.length > 0 && (
                <div className="shop-results-footer">
                  Showing {products.length} of {totalProducts} products
                </div>
              )}

            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
}
