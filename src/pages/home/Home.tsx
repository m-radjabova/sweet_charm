import Header from "./components/Header";
import BackstorySection from "./components/BackstorySection";
import CraftedWithLoveSection from "./components/CraftedWithLoveSection";
import FeaturedDesserts from "./components/FeaturedDesserts";
import BestSellersSection from "./components/BestSellersSection";
import ChefChoiceSection from "./components/ChefChoiceSection";
import LimitedOfferBanner from "./components/LimitedOfferBanner";
import HowItWorksSection from "./components/HowItWorksSection";
import SweetPointsPreview from "./components/SweetPointsPreview";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import OrderNowSection from "./components/OrderNowSection";
import ReviewsSection from "./components/ReviewsSection";
import SweetMomentsSection from "./components/SweetMomentsSection";
import StickyCartButton from "./components/StickyCartButton";
import BackToTopButton from "./components/BackToTopButton";
import NeedHelpButton from "./components/NeedHelpButton";
import BirthdayGreetingModal from "./components/BirthdayGreetingModal";
import useContextPro from "../../hooks/useContextPro";

function Home() {
  const {
    state: { user },
  } = useContextPro();

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-hero-bg)] text-[var(--color-text-primary)]">
      <div
        className="relative z-30 bg-[var(--color-header-bg)] bg-cover bg-center px-4 py-3 sm:px-8 sm:py-4"
      >
        <Header />
      </div>
      <Hero />
      <LimitedOfferBanner />
      <FeaturedDesserts />
      <ChefChoiceSection />
      <BestSellersSection />
      <HowItWorksSection />
      <OrderNowSection />
      <BackstorySection />
      <SweetPointsPreview />
      <CraftedWithLoveSection />
      <FaqSection />
      <ReviewsSection />
      <SweetMomentsSection />
      <Footer />
      <StickyCartButton />
      <NeedHelpButton />
      <BackToTopButton />
      <BirthdayGreetingModal enabled={Boolean(user?.id)} />
    </main>
  );
}

export default Home;
