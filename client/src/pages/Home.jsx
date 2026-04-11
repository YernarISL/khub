import React, { useEffect } from "react";
import { useCurrentUserStore, useMaterialStore } from "../app/store";
import { useTranslation } from "react-i18next";
import Header from "../components/Header/Header";
import ContinueWorking from "../components/ContinueWorking/ContinueWorking";
import CreateNewSection from "../components/CreateNewSection/CreateNewSection";
import YourMaterialsSection from "../components/YourMaterialsSection/YourMaterialsSection";
import RecentlyAddedSection from "../components/RecentlyAddedSection/RecentlyAddedSection";
import "../styles/Home.css";

const Home = () => {
  const user = useCurrentUserStore((state) => state.user);
  const fetchCurrentUser = useCurrentUserStore(
    (state) => state.fetchCurrentUser
  );
  const materials = useMaterialStore((state) => state.userMaterials);
  const fetchUserMaterials = useMaterialStore(
    (state) => state.fetchUserMaterials
  );
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchCurrentUser();
    fetchUserMaterials();
  }, []);

  if (!user || !materials) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="home-page-wrapper">
      <Header />
      <div className="home-page-container">
        <h1 className="home-page-first-heading">
          {t("home.greeting")}, {user.firstName}
        </h1>
        <h2 className="home-page-first-subheading">
          {t("home.subtitle")}
        </h2>
        <div className="home-page-hero-section-container">
          <ContinueWorking materials={materials}/>
          <CreateNewSection />
        </div>
        <h2 className="home-page-second-subheading">{t("home.yourMaterials")}</h2>
        <YourMaterialsSection />
        <h2 className="home-page-third-subheading">{t("home.recentlyAdded")}</h2>
        <RecentlyAddedSection materials={materials} />
        <footer className="home-page-footer">
          <p>© 2026 KBTU Student. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
