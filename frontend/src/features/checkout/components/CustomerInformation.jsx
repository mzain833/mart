
const fields = [
  {
    name: "fullName",
    label: "Full Name",
    placeholder: "Enter your full name",
    type: "text",
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email Address",
    placeholder: "you@example.com",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "phone",
    label: "Phone Number",
    placeholder: "+92 300 1234567",
    type: "tel",
    autoComplete: "tel",
  },
];

const CustomerInformation = ({ values, errors, onChange }) => {
  return (
    <section className="checkout-section">
      <div className="checkout-section-heading">
        <span className="checkout-section-number">01</span>
        <div>
          <h2>Customer Information</h2>
          <p>Enter your contact details.</p>
        </div>
      </div>

      <div className="checkout-form-grid">
        {fields.map((field) => (
          <div className="checkout-field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>

            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              value={values[field.name]}
              onChange={(event) =>
                onChange(field.name, event.target.value)
              }
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
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

export default CustomerInformation;
