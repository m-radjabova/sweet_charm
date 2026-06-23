import Header from "./components/Header";
import BackstorySection from "./components/BackstorySection";
import FeaturedDesserts from "./components/FeaturedDesserts";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import OrderNowSection from "./components/OrderNowSection";
import ReviewsSection from "./components/ReviewsSection";
import SweetMomentsSection from "./components/SweetMomentsSection";

function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-hero-bg)] text-[var(--color-text-primary)]">
      <div
        className="relative z-30 bg-[var(--color-header-bg)] bg-cover bg-center px-4 py-3 sm:px-8 sm:py-4"
       
      >
        <Header />
      </div>
      <Hero />
      <FeaturedDesserts />
      <OrderNowSection />
      <BackstorySection />
      <FaqSection />
      <ReviewsSection />
      <SweetMomentsSection />
      <Footer />
    </main>
  );
}

export default Home;
