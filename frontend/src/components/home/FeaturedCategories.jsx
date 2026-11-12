
const categories = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Technology for everyday life",
    symbol: "01",
    theme: "category-electronics",
    href: "/categories/electronics",
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Style that speaks for you",
    symbol: "02",
    theme: "category-fashion",
    href: "/categories/fashion",
  },
  {
    id: "home-living",
    name: "Home & Living",
    description: "Make your space yours",
    symbol: "03",
    theme: "category-living",
    href: "/categories/home-living",
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Everyday care and essentials",
    symbol: "04",
    theme: "category-beauty",
    href: "/categories/beauty",
  },
];

export default function FeaturedCategories() {
  return (
    <section className="home-section categories-section">
      <div className="home-container">

        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              EXPLORE THE STORE
            </span>

            <h2>Find Your Category</h2>

            <p>
              Explore collections that fit your lifestyle.
            </p>
          </div>

          <a href="/categories" className="section-link">
            All Categories <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <a
              href={category.href}
              className={`category-card ${category.theme}`}
              key={category.id}
            >
              <span className="category-number">
                {category.symbol}
              </span>

              <div className="category-card-content">
                <h3>{category.name}</h3>

                <p>{category.description}</p>

                <span className="category-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
