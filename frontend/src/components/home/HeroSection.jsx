
export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="home-container">
        <div className="hero-content">

          <span className="hero-eyebrow">
            THE NEXAMART EXPERIENCE
          </span>

          <h1>
            Discover More.
            <br />
            <span>Live Better.</span>
          </h1>

          <p className="hero-description">
            Explore a smarter shopping experience
            with products and essentials designed
            to complement your everyday life.
          </p>

          <div className="hero-actions">
            <a href="/shop" className="home-button home-button-primary">
              Explore Collection
              <span aria-hidden="true">→</span>
            </a>

            <a href="/about" className="hero-secondary-link">
              Discover NexaMart
            </a>
          </div>

          <div className="hero-trust-note">
            <span className="trust-indicator" />
            A smarter way to shop
          </div>

        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-orbit">
            <div className="hero-orbit-ring" />

            <div className="hero-core">
              <span>N</span>
            </div>

            <div className="hero-floating-card hero-card-top">
              <span className="floating-card-icon">✦</span>
              <span>Discover</span>
            </div>

            <div className="hero-floating-card hero-card-bottom">
              <span className="floating-card-icon">↗</span>
              <span>Explore</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
