
import { Link } from "react-router-dom";
import { UserRound, Package, ArrowRight } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useAccount from "../hooks/useAccount";
import AccountHeader from "../components/AccountHeader";
import AccountSidebar from "../components/AccountSidebar";
import "../account.css";

const AccountDashboard = () => {
  const { currentUser } = useAccount();

  return (
    <MainLayout>
      <main className="account-page">
        <div className="account-container">
          <AccountHeader
            title="My Dashboard"
            description="Welcome to your personal NexaMart account."
            user={currentUser}
          />

          <div className="account-layout">
            <AccountSidebar />

            <section className="account-content">
              <div className="account-welcome-card">
                <span className="account-eyebrow">YOUR ACCOUNT</span>
                <h2>Welcome, {currentUser.fullName}!</h2>
                <p>
                  Manage your profile and keep track of your shopping
                  activity from one place.
                </p>
              </div>

              <div className="account-quick-grid">
                <Link to="/account/profile" className="account-quick-card">
                  <span className="account-quick-icon">
                    <UserRound size={23} />
                  </span>
                  <strong>Personal Information</strong>
                  <span>Manage your account details.</span>
                  <ArrowRight size={17} />
                </Link>

                <Link to="/account/orders" className="account-quick-card">
                  <span className="account-quick-icon">
                    <Package size={23} />
                  </span>
                  <strong>My Orders</strong>
                  <span>View your order history.</span>
                  <ArrowRight size={17} />
                </Link>
              </div>

              <div className="account-information-card">
                <h3>Account Information</h3>

                <div className="account-information-row">
                  <span>Full Name</span>
                  <strong>{currentUser.fullName}</strong>
                </div>

                <div className="account-information-row">
                  <span>Email Address</span>
                  <strong>{currentUser.email}</strong>
                </div>

                <div className="account-information-row">
                  <span>Phone Number</span>
                  <strong>{currentUser.phone || "Not provided"}</strong>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default AccountDashboard;
