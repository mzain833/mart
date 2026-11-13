
const validateCheckoutForm = (values) => {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = "Please enter a valid full name.";
  }

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  const phone = values.phone.replace(/\D/g, "");

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (phone.length < 10 || phone.length > 15) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!values.addressLine1.trim()) {
    errors.addressLine1 = "Street address is required.";
  }

  if (!values.city.trim()) {
    errors.city = "City is required.";
  }

  if (!values.province.trim()) {
    errors.province = "Province is required.";
  }

  if (!values.postalCode.trim()) {
    errors.postalCode = "Postal code is required.";
  }

  return errors;
};

export default validateCheckoutForm;
