
import { ArrowDownWideNarrow, SlidersHorizontal } from "lucide-react";

export default function ProductToolbar({
  total,
  sortBy,
  onSortChange,
  onFilterClick,
}) {
  return (
    <div className="product-toolbar">

      <div className="toolbar-results">
        <span>Showing</span>
        <strong>{total}</strong>
        <span>products</span>
      </div>

      <div className="toolbar-actions">

        <button
          type="button"
          className="mobile-filter-button"
          onClick={onFilterClick}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>

        <label className="sort-control">
          <ArrowDownWideNarrow size={17} />

          <span>Sort by</span>

          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value)
            }
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </label>

      </div>
    </div>
  );
}
