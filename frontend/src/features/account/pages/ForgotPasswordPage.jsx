
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useAccount from "../hooks/useAccount";
import { validateEmail } from "../utils/accountValidation";
import "../account.css";

const ForgotPasswordPage = () => {
  const { requestPasswordReset } = useAccount();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateEmail(email);
    setError(validationError);

    if (validationError) return;

    setSubmitting(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch {
      setError("Unable to process your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-brand-mark">N</div>

          <span className="account-eyebrow">ACCOUNT RECOVERY</span>
          <h1>Forgot Password?</h1>
          <p className="auth-description">
            Enter your registered email address to begin account recovery.
          </p>

          {success ? (
            <div className="auth-success-message" role="status">
              Password recovery is not connected yet. Email delivery will
              be available after backend integration.
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="account-form-field">
                <label htmlFor="recovery-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="recovery-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                  />
                </div>
                {error && (
                  <span className="account-error">{error}</span>
                )}
              </div>

              <button
                type="submit"
                className="account-primary-button auth-submit"
                disabled={submitting}
              >
                <Send size={17} />
                {submitting ? "Processing..." : "Continue"}
              </button>
            </form>
          )}

          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </section>
      </main>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
