
import { useState } from "react";
import { X } from "lucide-react";

const CancelOrderDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (reason.trim().length < 5) {
      setError("Please enter at least 5 characters.");
      return;
    }

    onConfirm(reason.trim());
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <div className="cancel-dialog-overlay">
      <section
        className="cancel-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-dialog-title"
      >
        <button
          type="button"
          className="cancel-dialog-close"
          onClick={handleClose}
          aria-label="Close dialog"
          disabled={loading}
        >
          <X size={20} />
        </button>

        <h2 id="cancel-dialog-title">Cancel Order</h2>

        <p>Please tell us why you want to cancel this order.</p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError("");
            }}
            placeholder="Enter cancellation reason..."
            rows={4}
            maxLength={500}
            disabled={loading}
          />

          {error && <span className="cancel-dialog-error">{error}</span>}

          <div className="cancel-dialog-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
            >
              Keep Order
            </button>

            <button type="submit" disabled={loading}>
              {loading ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CancelOrderDialog;
