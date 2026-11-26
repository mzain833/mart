
import { useState } from "react";
import { Link, useNavigate,  Navigate } from "react-router-dom";
import { UserRound, Mail, Phone, LockKeyhole, ArrowRight } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useAccount from "../hooks/useAccount";
import { validateRegistration } from "../utils/accountValidation";
import "../account.css";

const initialValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAccount();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
  return <Navigate to="/account" replace />;
}

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateRegistration(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);

    try {
      await register(values);
      navigate("/account", { replace: true });
    } catch {
      setErrors({ general: "Unable to create your account." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <main className="auth-page">
        <section className="auth-card auth-card-wide">
          <div className="auth-brand-mark">N</div>

          <span className="account-eyebrow">JOIN NEXAMART</span>
          <h1>Create Account</h1>
          <p className="auth-description">
            Create your account for a better shopping experience.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {[
              {
                name: "fullName",
                label: "Full Name",
                type: "text",
                placeholder: "Your full name",
                icon: UserRound,
                autoComplete: "name",
              },
              {
                name: "email",
                label: "Email Address",
                type: "email",
                placeholder: "you@example.com",
                icon: Mail,
                autoComplete: "email",
              },
              {
                name: "phone",
                label: "Phone Number",
                type: "tel",
                placeholder: "+92 300 1234567",
                icon: Phone,
                autoComplete: "tel",
              },
              {
                name: "password",
                label: "Password",
                type: "password",
                placeholder: "Minimum 8 characters",
                icon: LockKeyhole,
                autoComplete: "new-password",
              },
              {
                name: "confirmPassword",
                label: "Confirm Password",
                type: "password",
                placeholder: "Repeat your password",
                icon: LockKeyhole,
                autoComplete: "new-password",
              },
            ].map((field) => {
              const Icon = field.icon;

              return (
                <div className="account-form-field" key={field.name}>
                  <label htmlFor={`register-${field.name}`}>
                    {field.label}
                  </label>

                  <div className="auth-input-wrapper">
                    <Icon size={18} />
                    <input
                      id={`register-${field.name}`}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      value={values[field.name]}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors[field.name])}
                    />
                  </div>

                  {errors[field.name] && (
                    <span className="account-error">
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              );
            })}

            {errors.general && (
              <p className="account-error">{errors.general}</p>
            )}

            <button
              type="submit"
              className="account-primary-button auth-submit"
              disabled={submitting}
            >
              {submitting ? "Creating Account..." : "Create Account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>

         
        </section>
      </main>
    </MainLayout>
  );
};

export default RegisterPage;
