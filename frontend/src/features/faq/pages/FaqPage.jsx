import { useState } from "react";
import { ChevronDown } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import "./faq.css";

const FAQ_ITEMS = [
  {
    category: "Orders",
    question: "How can I place an order?",
    answer:
      "Browse our products, add your preferred items to the cart, and complete checkout with your contact and delivery details.",
  },
  {
    category: "Payments",
    question: "Which payment methods are available?",
    answer:
      "NexaMart currently supports Cash on Delivery (COD). Online payment options are not available at this time.",
  },
  {
    category: "Orders",
    question: "Can I place an order without creating an account?",
    answer:
      "Yes. You can place an order as a guest and access your order confirmation using the secure confirmation link provided after checkout.",
  },
  {
    category: "Account",
    question: "Where can I view my orders?",
    answer:
      "Sign in to your NexaMart account and visit the My Orders section to view your order history and available order details.",
  },
  {
    category: "Orders",
    question: "Can I cancel my order?",
    answer:
      "Eligible orders can be cancelled through the available order cancellation option. Cancellation depends on the current order status.",
  },
  {
    category: "Support",
    question: "How can I contact NexaMart?",
    answer:
      "You can reach our support team through WhatsApp or email using the details available on our Contact page.",
  },
];

export default function FaqPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <MainLayout>
      <main className="faq-page">
        <section className="faq-hero">
          <span className="faq-eyebrow">CUSTOMER SUPPORT</span>
          <h1>Frequently Asked Questions</h1>
          <p>
            Find clear answers to common questions about shopping
            and using NexaMart.
          </p>
        </section>

        <section className="faq-content">
          <div className="faq-heading">
            <span>NEED SOME HELP?</span>
            <h2>How can we help you?</h2>
            <p>
              Explore the answers below. If you need further
              assistance, our support team is here to help.
            </p>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = activeIndex === index;

              return (
                <article
                  className={`faq-item ${isOpen ? "is-open" : ""}`}
                  key={item.question}
                >
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() =>
                      setActiveIndex(isOpen ? -1 : index)
                    }
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span>
                      <small>{item.category}</small>
                      {item.question}
                    </span>

                    <ChevronDown
                      size={19}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div
                      className="faq-answer"
                      id={`faq-answer-${index}`}
                    >
                      <p>{item.answer}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="faq-contact">
            <div>
              <h3>Still have a question?</h3>
              <p>Our support team is ready to assist you.</p>
            </div>

            <a href="/contact">Contact Support</a>
          </div>
        </section>
      </main>
    </MainLayout>
  );
}