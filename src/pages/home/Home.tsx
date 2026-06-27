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
import Seo from "../../components/Seo";
import { SITE_URL } from "../../components/seoConfig";

function SectionBlock({ children }: { children: React.ReactNode }) {
  return <section className="relative">{children}</section>;
}

function Home() {
  const {
    state: { user },
  } = useContextPro();
  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SweetCharm",
      url: SITE_URL,
      logo: `${SITE_URL}/cupcake.png`,
      image: `${SITE_URL}/website.png`,
      description:
        "SweetCharm is a cozy dessert cafe offering handcrafted cakes, cupcakes, macarons, premium coffee, and sweet rewards.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "SweetCharm",
      url: SITE_URL,
      description:
        "Discover handcrafted desserts, cozy cafe vibes, premium coffee, and sweet rewards at SweetCharm.",
      publisher: {
        "@type": "Organization",
        name: "SweetCharm",
      },
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-hero-bg)] text-[var(--color-text-primary)]">
      <Seo
        title="SweetCharm | Handmade Desserts"
        description="Discover handcrafted desserts, cozy cafe vibes, premium coffee, and sweet rewards at SweetCharm."
        path="/"
        structuredData={homeSchema}
      />

      <div className="relative z-30 bg-[var(--color-header-bg)] bg-cover bg-center px-4 py-3 sm:px-8 sm:py-4">
        <Header />
      </div>

      <Hero />

      <div className="relative z-10">
        <SectionBlock>
          <LimitedOfferBanner />
        </SectionBlock>
        <SectionBlock>
          <FeaturedDesserts />
        </SectionBlock>
        <SectionBlock>
          <ChefChoiceSection />
        </SectionBlock>
        <SectionBlock>
          <BestSellersSection />
        </SectionBlock>
        <SectionBlock>
          <HowItWorksSection />
        </SectionBlock>
        <SectionBlock>
          <OrderNowSection />
        </SectionBlock>
        <SectionBlock>
          <BackstorySection />
        </SectionBlock>
        <SectionBlock>
          <SweetPointsPreview />
        </SectionBlock>
        <SectionBlock>
          <CraftedWithLoveSection />
        </SectionBlock>
        <SectionBlock>
          <FaqSection />
        </SectionBlock>
        <SectionBlock>
          <ReviewsSection />
        </SectionBlock>
        <SectionBlock>
          <SweetMomentsSection />
        </SectionBlock>
        <SectionBlock>
          <Footer />
        </SectionBlock>
      </div>

      <StickyCartButton />
      <NeedHelpButton />
      <BackToTopButton />
      <BirthdayGreetingModal enabled={Boolean(user?.id)} />
    </main>
  );
}

export default Home;
