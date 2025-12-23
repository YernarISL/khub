import React from "react";
import Header from "../components/Header/Header";
import UserMaterialsPage from "../components/UserMaterialsPage/UserMaterialsPage";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-page-wrapper">
      <Header/>
      <div className="home-page-container">
        <h2>My Research Collection</h2>
        <UserMaterialsPage />
        <footer className="footer">
          <p>© 2023 Academic Research Library. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
