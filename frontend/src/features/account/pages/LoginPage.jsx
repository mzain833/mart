
import { useState } from "react";
import { Link, useNavigate,  Navigate } from "react-router-dom";
import { LockKeyhole, Mail, ArrowRight } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useAccount from "../hooks/useAccount";
import { validateLogin } from "../utils/accountValidation";
import "../account.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAccount();

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

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

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);

    try {
      await login(values);
      navigate("/account", { replace: true });
    } catch {
      setErrors({ general: "Unable to sign in. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-brand-mark">N</div>

          <span className="account-eyebrow">WELCOME BACK</span>
          <h1>Sign In</h1>
          <p className="auth-description">
            Access your NexaMart account and manage your orders.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="account-form-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && (
                <span className="account-error">{errors.email}</span>
              )}
            </div>

            <div className="account-form-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <div className="auth-input-wrapper">
                <LockKeyhole size={18} />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                />
              </div>
              {errors.password && (
                <span className="account-error">{errors.password}</span>
              )}
            </div>

            {errors.general && (
              <p className="account-error">{errors.general}</p>
            )}

            <button
              type="submit"
              className="account-primary-button auth-submit"
              disabled={submitting}
            >
              {submitting ? "Signing In..." : "Sign In"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>

          <p className="auth-demo-note">
            Demo mode: any valid email and password of at least 8 characters
            will create a demo session. No real authentication is performed.
          </p>
        </section>
      </main>
    </MainLayout>
  );
};

export default LoginPage;
