
import {
  ArrowRight,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { Link } from "react-router-dom";

const FOOTER_GROUPS = [
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

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    Icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    Icon: Facebook,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    Icon: Linkedin,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="brand footer-logo">
            <span className="brand-mark">N</span>

            <span className="brand-name">
              Nexa<span>Mart</span>
            </span>
          </Link>

          <p>
            A smarter way to discover, explore and shop.
            Thoughtfully selected products for modern living.
          </p>

          <div className="footer-socials">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <div className="footer-group" key={group.title}>
            <h3>{group.title}</h3>

            <ul>
              {group.links.map(([label, href]) => (
                <li key={href}>
                  <Link to={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-newsletter">
        <div>
          <span className="footer-eyebrow">
            STAY CONNECTED
          </span>

          <h3>Something worth discovering.</h3>

          <p>
            Stay informed about our latest collections and updates.
          </p>
        </div>

        <Link to="/shop" className="footer-explore-link">
          Explore NexaMart
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} NexaMart. All rights reserved.
        </p>

        <span>
          Designed for a smarter shopping experience.
        </span>
      </div>
    </footer>
  );
}
