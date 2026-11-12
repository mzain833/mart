
import { SlidersHorizontal, X } from "lucide-react";

const categories = [
  "Electronics",
  "Fashion",
  "Accessories",
  "Home & Living",
];

const ratings = [4, 3, 2];

export default function ProductFilters({
  category,
  onCategoryChange,
  maxPrice,
  onMaxPriceChange,
  minRating,
  onMinRatingChange,
  inStockOnly,
  onInStockChange,
  onClear,
  onClose,
}) {
  return (
    <aside className="product-filters">

      <div className="filter-heading">
        <div>
          <SlidersHorizontal size={19} />
          <h3>Filters</h3>
        </div>

        <button
          type="button"
          className="filter-mobile-close"
          onClick={onClose}
          aria-label="Close filters"
        >
          <X size={19} />
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-section-heading">
          <h4>Categories</h4>
        </div>

        <label className="filter-option">
          <input
            type="radio"
            name="category"
            checked={category === "all"}
            onChange={() => onCategoryChange("all")}
          />
          <span>All Categories</span>
        </label>

        {categories.map((item) => (
          <label className="filter-option" key={item}>
            <input
              type="radio"
              name="category"
              checked={category === item}
              onChange={() => onCategoryChange(item)}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <div className="filter-section-heading">
          <h4>Maximum Price</h4>
          <strong>
            Rs. {maxPrice.toLocaleString("en-PK")}
          </strong>
        </div>

        <input
          className="filter-range"
          type="range"
          min="5000"
          max="100000"
          step="1000"
          value={maxPrice}
          onChange={(event) =>
            onMaxPriceChange(Number(event.target.value))
          }
          aria-label="Maximum price"
        />

        <div className="filter-range-labels">
          <span>Rs. 5,000</span>
          <span>Rs. 100,000</span>
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-section-title">
          Customer Rating
        </h4>

        {ratings.map((rating) => (
          <label className="filter-option" key={rating}>
            <input
              type="radio"
              name="rating"
              checked={minRating === rating}
              onChange={() =>
                onMinRatingChange(
                  minRating === rating ? 0 : rating
                )
              }
            />

            <span>{rating}+ Stars</span>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <label className="filter-option">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) =>
              onInStockChange(event.target.checked)
            }
          />

          <span>In Stock Only</span>
        </label>
      </div>

      <button
        type="button"
        className="filter-reset-button"
        onClick={onClear}
      >
        Clear All Filters
      </button>

    </aside>
  );
}
