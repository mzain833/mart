
import { useState } from "react";
import { ArrowRight, X } from "lucide-react";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      className="announcement-bar"
      aria-label="Store announcement"
    >
      <p className="announcement-message">
        <span className="announcement-highlight">
          THE NEXAMART EXPERIENCE
        </span>

        <span className="announcement-divider">·</span>

        Discover exceptional products, thoughtfully selected.
      </p>

      <a href="/shop" className="announcement-link">
        Explore now <ArrowRight size={13} />
      </a>

      <button
        type="button"
        className="announcement-close"
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss announcement"
      >
        <X size={15} />
      </button>
    </aside>
  );
}
