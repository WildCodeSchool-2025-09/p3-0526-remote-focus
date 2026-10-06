import DiscoverSection from "../components/Catalog/DiscoverSection";
import HomeHero from "../components/Homepage/HomeHero";
import HomeSection from "../components/Homepage/HomeSection";
import RecommendedSection from "../components/Homepage/RecommendedSection";
import VisitorBanner from "../components/Homepage/VisitorBanner";
import { useAuth } from "../contexts/AuthContext";

function Homepage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <HomeHero />
      {isAuthenticated && <RecommendedSection />}
      {!isAuthenticated && <VisitorBanner />}
      <DiscoverSection showGenreSections={false} />
      <HomeSection />
    </>
  );
}

export default Homepage;
