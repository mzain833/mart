
import {
  ArrowRight,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";

const footerGroups = [
  {
    title: "Discover",
    links: [
      ["Home", "/"],
      ["Shop All", "/shop"],
      ["Categories", "/categories"],
      ["New Arrivals", "/new-arrivals"],
      ["Best Sellers", "/best-sellers"],
    ],
  },
  {
    title: "Customer Care",
    links: [
      ["Contact Us", "/contact"],
      ["Frequently Asked Questions", "/faqs"],
      ["Shipping Information", "/shipping"],
      ["Returns & Refunds", "/returns"],
    ],
  },
  {
    title: "Our Company",
    links: [
      ["About NexaMart", "/about"],
      ["Privacy Policy", "/privacy"],
      ["Terms & Conditions", "/terms"],
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">

      <div className="footer-main">

        <div className="footer-brand">
          <a href="/" className="brand footer-logo">
            <span className="brand-mark">N</span>

            <span className="brand-name">
              Nexa<span>Mart</span>
            </span>
          </a>

          <p>
            A smarter way to discover, explore and shop.
            Thoughtfully selected products for modern living.
          </p>

          <div className="footer-socials">
            <a href="https://instagram.com" aria-label="Instagram">
              <Instagram size={17} />
            </a>

            <a href="https://facebook.com" aria-label="Facebook">
              <Facebook size={17} />
            </a>

            <a href="https://linkedin.com" aria-label="LinkedIn">
              <Linkedin size={17} />
            </a>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div className="footer-group" key={group.title}>
            <h3>{group.title}</h3>

            <ul>
              {group.links.map(([label, href]) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      <div className="footer-newsletter">
        <div>
          <span className="footer-eyebrow">STAY CONNECTED</span>
          <h3>Something worth discovering.</h3>
          <p>Stay informed about our latest collections and updates.</p>
        </div>

        <a href="/shop" className="footer-explore-link">
          Explore NexaMart <ArrowRight size={16} />
        </a>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} NexaMart. All rights reserved.
        </p>

        <span>Designed for a smarter shopping experience.</span>
      </div>

    </footer>
  );
}
