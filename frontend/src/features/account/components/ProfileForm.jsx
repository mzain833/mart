
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { validateProfile } from "../utils/accountValidation";

const ProfileForm = ({ user, onSave }) => {
  const [values, setValues] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setValues({
      fullName: user.fullName || "",
      phone: user.phone || "",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateProfile(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    setSaving(true);

    try {
      await onSave(values);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="account-form" onSubmit={handleSubmit} noValidate>
      <div className="account-form-field">
        <label htmlFor="profile-name">Full Name</label>
        <input
          id="profile-name"
          name="fullName"
          value={values.fullName}
          onChange={handleChange}
          autoComplete="name"
          aria-invalid={Boolean(errors.fullName)}
        />
        {errors.fullName && (
          <span className="account-error">{errors.fullName}</span>
        )}
      </div>

      <div className="account-form-field">
        <label htmlFor="profile-email">Email Address</label>
        <input
          id="profile-email"
          type="email"
          value={user.email}
          disabled
        />
        <small className="account-field-note">
          Email changes require backend verification.
        </small>
      </div>

      <div className="account-form-field">
        <label htmlFor="profile-phone">Phone Number</label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          value={values.phone}
          onChange={handleChange}
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone && (
          <span className="account-error">{errors.phone}</span>
        )}
      </div>

      {message && (
        <p className="account-form-message" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        className="account-primary-button"
        disabled={saving}
      >
        <Save size={17} />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};

export default ProfileForm;
