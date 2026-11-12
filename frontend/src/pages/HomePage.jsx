
import MainLayout from "../layouts/MainLayout";

import HeroSection from "../components/home/HeroSection";
import FeaturedCategories from "../components/home/FeaturedCategories";
import TrendingProducts from "../components/home/TrendingProducts";
import PromotionalBanner from "../components/home/PromotionalBanner";
import BestSellers from "../components/home/BestSellers";
import NewsletterSection from "../components/home/NewsletterSection";

import "../components/home/home.css";

export default function HomePage() {
  return (
    <MainLayout>
      <div className="home-page">
        <HeroSection />

        <FeaturedCategories />

        <TrendingProducts />

        <PromotionalBanner />

        <BestSellers />

        <NewsletterSection />
      </div>
    </MainLayout>
  );
}
