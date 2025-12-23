import React, { useEffect } from "react";
import "./Header.css";
import { useAuthStore, useUsername } from "../../store";
import { getCurrentUser } from "../../services/userService";
import { useNavigate, NavLink, Link } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";

const Header = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isAuth = useAuthStore((state) => state.isAuth);
  const navigate = useNavigate();

  const username = useUsername((state) => state.username);
  const setUsername = useUsername((state) => state.setUsername);

  useEffect(() => {
    const assignUsername = async () => {
      try {
        if (!isAuth) return; 

        const user = await getCurrentUser();
        setUsername(user.username);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
          console.log("User not authenticated");
          setUsername(null);
        } else {
          console.error("Error fetching user:", error);
        }
      }
    };

    assignUsername();
  }, [isAuth, setUsername]);

  return (
    <div className="header-wrapper">
      <div className="header-container">
        <img
          className="logo-in-header"
          src="src\assets\logo.png"
          alt="logo image"
        />
        <SearchBar />
        <nav className="header-nav-bar">
          <NavLink to="/sandbox" className="header-sandbox-link">Sandbox</NavLink>
          <NavLink to="/upload-pdf" className="header-uploadPdf-link">Upload PDF</NavLink>
        </nav>
        <div className="header-profile-section">
          <Link to="/profile">
            <img src="src/assets/profile_default.svg" alt="profile image" />
          </Link>
          <Link to="/profile">{username}</Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
