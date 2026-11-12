
export default function BestSellers({ products = [] }) {
  const hasProducts = products.length > 0;

  return (
    <section className="home-section best-sellers-section">
      <div className="home-container">

        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              CUSTOMER FAVOURITES
            </span>

            <h2>Best Sellers</h2>

            <p>Discover products customers love.</p>
          </div>

          <a href="/shop?sort=best-selling" className="section-link">
            View Collection <span aria-hidden="true">→</span>
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
              ♡
            </div>

            <h3>Your next favourite awaits.</h3>

            <p>
              Our best-selling products will be featured
              here once the product catalog is connected.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
