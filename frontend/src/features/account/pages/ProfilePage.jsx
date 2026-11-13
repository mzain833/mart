
import MainLayout from "../../../layouts/MainLayout";
import useAccount from "../hooks/useAccount";
import AccountHeader from "../components/AccountHeader";
import AccountSidebar from "../components/AccountSidebar";
import ProfileForm from "../components/ProfileForm";
import "../account.css";

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAccount();

  return (
    <MainLayout>
      <main className="account-page">
        <div className="account-container">
          <AccountHeader
            title="My Profile"
            description="Manage your personal information."
            user={currentUser}
          />

          <div className="account-layout">
            <AccountSidebar />

            <section className="account-content">
              <div className="account-panel">
                <div className="account-panel-heading">
                  <h2>Personal Information</h2>
                  <p>Keep your contact information up to date.</p>
                </div>

                <ProfileForm
                  user={currentUser}
                  onSave={updateProfile}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default ProfilePage;
