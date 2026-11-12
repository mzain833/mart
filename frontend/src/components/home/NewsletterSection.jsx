
import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) return;

    // Newsletter API integration will be added later.
    setEmail("");
  };

  return (
    <section className="newsletter-section">
      <div className="home-container">

        <div className="newsletter-content">
          <span className="section-eyebrow">
            STAY CONNECTED
          </span>

          <h2>
            A little more inspiration
            <br />
            in your inbox.
          </h2>

          <p>
            Stay connected with NexaMart for
            updates and future announcements.
          </p>

          <form
            className="newsletter-form"
            onSubmit={handleSubmit}
          >
            <label
              className="visually-hidden"
              htmlFor="newsletter-email"
            >
              Email address
            </label>

            <input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <button type="submit" disabled>
              Coming Soon
            </button>
          </form>

          <p className="newsletter-note">
            Newsletter subscriptions will be available
            after backend integration.
          </p>
        </div>

      </div>
    </section>
  );
}
