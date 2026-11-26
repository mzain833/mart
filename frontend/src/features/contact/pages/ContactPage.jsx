import {
  ArrowUpRight,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";

import "./contact.css";

const CONTACT_DETAILS = {
  phone: "03260907880",
  email: "za3057428@gmail.com",
  whatsappUrl:
    "https://wa.me/923260907880?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20NexaMart.",
};

const contactMethods = [
  {
    title: "WhatsApp Support",
    description:
      "Connect with our support team for order assistance, product inquiries, and general questions.",
    value: CONTACT_DETAILS.phone,
    href: CONTACT_DETAILS.whatsappUrl,
    action: "Chat on WhatsApp",
    icon: MessageCircle,
    external: true,
  },
  {
    title: "Email Support",
    description:
      "Send us an email for general inquiries, feedback, or customer support assistance.",
    value: CONTACT_DETAILS.email,
    href: `mailto:${CONTACT_DETAILS.email}`,
    action: "Send an Email",
    icon: Mail,
    external: false,
  },
];

export default function ContactPage() {
  return (
    <MainLayout>
      <main className="contact-page">
        <section className="contact-hero">
          <span className="contact-eyebrow">
            NEXAMART CUSTOMER CARE
          </span>

          <h1>
            We're here to
            <span> help you.</span>
          </h1>

          <p>
            Have a question or need assistance?
            Our team is here to make your shopping
            experience smooth and convenient.
          </p>
        </section>

        <section
          className="contact-content"
          aria-labelledby="contact-heading"
        >
          <div className="contact-intro">
            <span className="contact-section-label">
              GET IN TOUCH
            </span>

            <h2 id="contact-heading">
              Let's make your experience better.
            </h2>

            <p>
              Whether you have a question about a product,
              an order, or your shopping experience,
              feel free to reach out through our official
              support channels.
            </p>
          </div>

          <div className="contact-methods">
            {contactMethods.map((method) => {
              const Icon = method.icon;

              return (
                <article
                  className="contact-method-card"
                  key={method.title}
                >
                  <div className="contact-method-icon">
                    <Icon size={23} strokeWidth={1.7} />
                  </div>

                  <div className="contact-method-content">
                    <h3>{method.title}</h3>

                    <p>{method.description}</p>

                    <a
                      className="contact-method-value"
                      href={method.href}
                      target={
                        method.external ? "_blank" : undefined
                      }
                      rel={
                        method.external
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {method.value}
                    </a>

                    <a
                      className="contact-method-action"
                      href={method.href}
                      target={
                        method.external ? "_blank" : undefined
                      }
                      rel={
                        method.external
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {method.action}
                      <ArrowUpRight size={16} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="contact-assurance">
          <div className="contact-assurance-icon">
            <Phone size={21} />
          </div>

          <div>
            <h3>We're happy to help.</h3>
            <p>
              Contact NexaMart through WhatsApp or email
              and our team will assist you with your inquiry.
            </p>
          </div>
        </section>
      </main>
    </MainLayout>
  );
}