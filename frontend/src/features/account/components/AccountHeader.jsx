
import { UserRound } from "lucide-react";

const AccountHeader = ({ title, description, user }) => {
  return (
    <div className="account-page-header">
      <div>
        <span className="account-eyebrow">NEXAMART ACCOUNT</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {user && (
        <div className="account-user-badge">
          <span className="account-avatar">
            <UserRound size={20} />
          </span>
          <span>
            <strong>{user.fullName}</strong>
            <small>{user.email}</small>
          </span>
        </div>
      )}
    </div>
  );
};

export default AccountHeader;
