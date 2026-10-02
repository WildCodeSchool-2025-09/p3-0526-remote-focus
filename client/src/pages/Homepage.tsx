import HomeHero from "../components/Homepage/HomeHero";
import HomeSection from "../components/Homepage/HomeSection";
import VisitorBanner from "../components/Homepage/VisitorBanner";
import { useAuth } from "../contexts/AuthContext";

function Homepage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <HomeHero />
      {!isAuthenticated && <VisitorBanner />}
      <HomeSection />
    </>
  );
}

export default Homepage;
