
import AnnouncementBar from "./AnnouncementBar";
import Header from "./Header";
import Navigation from "./Navigation";
import Footer from "./Footer";
import "./layouts.css";

export default function MainLayout({ children }) {
  return (
    <div className="app-shell">

      <AnnouncementBar />

      <Header />

      <Navigation />

      <main className="main-content" id="main-content">
        {children}
      </main>

      <Footer />

    </div>
  );
}
