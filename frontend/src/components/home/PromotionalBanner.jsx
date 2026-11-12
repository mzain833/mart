
export default function PromotionalBanner() {
  return (
    <section className="promotion-section">
      <div className="home-container">

        <div className="promotion-banner">

          <div className="promotion-content">
            <span className="section-eyebrow">
              A NEW WAY TO DISCOVER
            </span>

            <h2>
              Shopping that
              <br />
              feels different.
            </h2>

            <p>
              Explore a thoughtfully designed
              shopping experience built around
              simplicity and discovery.
            </p>

            <a
              href="/about"
              className="home-button promotion-button"
            >
              Discover Our Story
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="promotion-decoration" aria-hidden="true">
            <div className="promotion-circle">
              <span>N</span>
            </div>

            <div className="promotion-decoration-dot" />
          </div>

        </div>

      </div>
    </section>
  );
}
