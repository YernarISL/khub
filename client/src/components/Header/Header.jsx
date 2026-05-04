import React, { useEffect, useMemo } from "react";
import { useAuthStore } from "../../app/store";
import { NavLink, Link } from "react-router-dom";
import { getCurrentUser } from "../../services/userService";
import { useTranslation } from "react-i18next";
import { FiBell } from "react-icons/fi";
import SearchBar from "../UI/SearchBar/SearchBar";
import { ROLES } from "../../shared/constants/roles";

import "./Header.css";

function shortDisplayName(user) {
  const first = user?.firstName?.trim() || "";
  const second = user?.secondName?.trim() || "";
  if (first && second) {
    return `${first} ${second[0]}.`;
  }
  if (first) return first;
  return user?.username || "";
}

function userInitials(user) {
  const parts = [user?.firstName, user?.secondName].filter(Boolean);
  if (parts.length > 0) {
    return parts
      .map((s) => s.trim()[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  const u = user?.username?.trim();
  return u ? u.slice(0, 2).toUpperCase() : "?";
}

const Header = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setAuth(res))
      .catch(() => clearAuth());
  }, [clearAuth, setAuth]);

  const displayName = useMemo(() => (user ? shortDisplayName(user) : ""), [user]);
  const initials = useMemo(() => (user ? userInitials(user) : ""), [user]);
  const roleLabel = useMemo(() => {
    if (!user) return "";

    const roleTranslationKeyByRole = {
      [ROLES.ADMIN]: "header.roleAdmin",
      [ROLES.MANAGER]: "header.roleManager",
      [ROLES.TEACHER]: "header.roleTeacher",
      [ROLES.STUDENT]: "header.roleStudent",
      [ROLES.USER]: "header.roleUser",
    };

    return t(roleTranslationKeyByRole[user.role] ?? "header.roleUser");
  }, [user, t]);

  if (isLoading) {
    return (
      <header className="header-shell">
        <div className="header-inner header-inner--loading">
          <span className="header-loading">{t("header.loading")}</span>
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="header-shell">
        <div className="header-inner header-inner--loading">
          <span className="header-loading">{t("header.loading")}</span>
        </div>
      </header>
    );
  }

  const navClass = ({ isActive }) =>
    `header-nav-link${isActive ? " header-nav-link--active" : ""}`;

  return (
    <header className="header-shell">
      <div className="header-inner">
        <div className="header-search">
          <SearchBar />
        </div>

        <nav className="header-nav" aria-label={t("header.mainNav")}>
          <NavLink to="/myworks" className={navClass}>
            {t("header.myWorks")}
          </NavLink>
          <NavLink to="/sandbox" className={navClass}>
            {t("header.sandbox")}
          </NavLink>
          {user.role === ROLES.ADMIN && (
            <NavLink to="/admin" className={navClass}>
              {t("adminPanel")}
            </NavLink>
          )}
        </nav>

        <div className="header-trailing">
          <button
            type="button"
            className="header-icon-btn"
            aria-label={t("header.notifications")}
          >
            <FiBell size={20} strokeWidth={1.75} aria-hidden />
          </button>

          <Link to="/profile" className="header-user-block">
            {user.profileImage ? (
              <span className="header-user-avatar header-user-avatar--photo">
                <img src={user.profileImage} alt="" />
              </span>
            ) : (
              <span className="header-user-avatar" aria-hidden>
                {initials}
              </span>
            )}
            <span className="header-user-meta">
              <span className="header-user-name">{displayName}</span>
              <span className="header-user-role">{roleLabel}</span>
            </span>
          </Link>

          <div className="header-lang">
            <svg
              className="header-lang-globe"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                fill="currentColor"
                d="M12 22q-2.05 0-3.875-.788t-3.187-2.15t-2.15-3.187T2 12q0-2.075.788-3.887t2.15-3.175t3.187-2.15T12 2q2.075 0 3.888.788t3.174 2.15t2.15 3.175T22 12q0 2.05-.788 3.875t-2.15 3.188t-3.175 2.15T12 22m0-2.05q.65-.9 1.125-1.875T13.9 16h-3.8q.3 1.1.775 2.075T12 19.95m-2.6-.4q-.45-.825-.787-1.713T8.05 16H5.1q.725 1.25 1.813 2.175T9.4 19.55m5.2 0q1.4-.45 2.488-1.375T18.9 16h-2.95q-.225.95-.562 1.838T14.6 19.55M4.25 14h3.4q-.075-.5-.112-.987T7.5 12t.038-1.012T7.65 10h-3.4q-.125.5-.187.988T4 12t.063 1.013t.187.987m5.4 0h4.7q.075-.5.113-.987T14.5 12t-.038-1.012T14.35 10h-4.7q-.075.5-.112.988T9.5 12t.038 1.013t.112.987m6.7 0h3.4q.125-.5.188-.987T20 12t-.062-1.012T19.75 10h-3.4q.075.5.113.988T16.5 12t-.038 1.013t-.112.987m-.4-6h2.95q-.725-1.25-1.812-2.175T14.6 4.45q.45.825.788 1.713T15.95 8M10.1 8h3.8q-.3-1.1-.775-2.075T12 4.05q-.65.9-1.125 1.875T10.1 8m-5 0h2.95q.225-.95.563-1.838T9.4 4.45Q8 4.9 6.912 5.825T5.1 8"
              />
            </svg>
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="header-lang-select"
              aria-label={t("language")}
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
