const fields = [
  {
    name: "addressLine1",
    label: "Street Address",
    placeholder: "House number, street name",
    wide: true,
  },
  {
    name: "addressLine2",
    label: "Apartment / Landmark",
    placeholder: "Optional",
    wide: true,
    optional: true,
  },
  {
    name: "city",
    label: "City",
    placeholder: "e.g. Islamabad",
  },
  {
    name: "province",
    label: "Province",
    placeholder: "e.g. Islamabad Capital Territory",
  },
  {
    name: "area",
    label: "Area / Sector",
    placeholder: "e.g. F-7, G-10, Bahria Town",
    wide: true,
  },
  {
    name: "postalCode",
    label: "Postal Code",
    placeholder: "Postal code",
  },
];

const ShippingAddressForm = ({ values, errors, onChange }) => {
  return (
    <section className="checkout-section">
      <div className="checkout-section-heading">
        <span className="checkout-section-number">02</span>

        <div>
          <h2>Shipping Address</h2>
          <p>Where should we deliver your order?</p>
        </div>
      </div>

      <div className="checkout-form-grid">
        {fields.map((field) => (
          <div
            className={`checkout-field ${field.wide ? "full-width" : ""}`}
            key={field.name}
          >
            <label htmlFor={field.name}>
              {field.label}

              {field.optional && (
                <span className="optional-label"> (Optional)</span>
              )}
            </label>

            <input
              id={field.name}
              name={field.name}
              type="text"
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(event) =>
                onChange(field.name, event.target.value)
              }
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name]
                  ? `${field.name}-error`
                  : undefined
              }
            />

            {errors[field.name] && (
              <span
                className="checkout-error"
                id={`${field.name}-error`}
              >
                {errors[field.name]}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShippingAddressForm;