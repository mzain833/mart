
export default function TrendingProducts({ products = [] }) {
  const hasProducts = products.length > 0;

  return (
    <section className="home-section products-section">
      <div className="home-container">

        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              WHAT'S POPULAR
            </span>

            <h2>Trending Now</h2>

            <p>Discover what's gaining attention.</p>
          </div>

          <a href="/shop?sort=trending" className="section-link">
            Explore All <span aria-hidden="true">→</span>
          </a>
        </div>

        {hasProducts ? (
          <div className="products-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <a href={`/products/${product.slug}`}>
                  <div className="product-image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>

                  <div className="product-information">
                    <h3>{product.name}</h3>

                    <p className="product-price">
                      {product.price}
                    </p>
                  </div>
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="products-empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              ✦
            </div>

            <h3>Something exciting is coming.</h3>

            <p>
              Our trending collection will appear here
              as soon as products are available.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
