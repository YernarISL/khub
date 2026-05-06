import React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiBarChart2,
  FiBookOpen,
  FiHome,
  FiLayers,
  FiMessageSquare,
  FiSettings,
  FiUserCheck,
} from "react-icons/fi";
import logo from "../../assets/logo.png";
import { useAuthStore } from "../../app/store";
import { ROLES } from "../../shared/constants/roles";

import "./Sidebar.css";

const iconProps = { size: 18, strokeWidth: 1.75, "aria-hidden": true };

function pathMatches(pathname, href) {
  if (href === "/home") {
    return pathname === "/home";
  }
  if (href === "/myworks") {
    return (
      pathname.startsWith("/myworks") ||
      pathname.startsWith("/materials/") ||
      pathname === "/upload-pdf"
    );
  }
  if (href === "/analytics") {
    return pathname.startsWith("/analytics");
  }
  if (href === "/identity-requests") {
    return pathname.startsWith("/identity-requests");
  }
  if (href === "/sandbox") {
    return pathname.startsWith("/sandbox");
  }
  if (href === "/teacher") {
    return pathname.startsWith("/teacher");
  }
  if (href === "/teacher/dialogues") {
    return pathname.startsWith("/teacher/dialogues");
  }
  if (href === "/teacher/personalization") {
    return pathname.startsWith("/teacher/personalization");
  }
  if (href === "/student/assistant") {
    return pathname.startsWith("/student/assistant");
  }
  if (href === "/student/dialogues") {
    return pathname.startsWith("/student/dialogues");
  }
  return false;
}

export default function Sidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);

  const mainLinks = [
    { to: "/home", label: t("sidebar.home"), Icon: FiHome },
    { to: "/myworks", label: t("sidebar.knowledgeHub"), Icon: FiBookOpen },
    ...(user?.role === ROLES.MANAGER
      ? [
          { to: "/analytics", label: t("sidebar.analytics"), Icon: FiBarChart2 },
          { to: "/identity-requests", label: t("sidebar.identityRequests"), Icon: FiUserCheck },
        ]
      : []),
    ...(user?.role === ROLES.TEACHER
      ? [
          { to: "/teacher/dialogues", label: "Dialogues", Icon: FiMessageSquare },
          { to: "/teacher/personalization", label: "Personalization", Icon: FiUserCheck },
          { to: "/teacher", label: t("sidebar.teacherCabinet"), Icon: FiBarChart2 },
        ]
      : []),
    ...(user?.role === ROLES.STUDENT
      ? [
          { to: "/student/dialogues", label: t("sidebar.dialogues"), Icon: FiMessageSquare },
          { to: "/student/assistant", label: t("sidebar.studentAssistant"), Icon: FiUserCheck },
        ]
      : []),
    { to: "/sandbox", label: t("sidebar.aiAgent"), Icon: FiMessageSquare },
  ];

  const linkClass = (href) =>
    `sidebar-link${pathMatches(pathname, href) ? " sidebar-link--active" : ""}`;

  return (
    <aside className="sidebar" aria-label={t("sidebar.ariaLabel")}>
      <div className="sidebar-brand">
        <Link to="/home" className="sidebar-brand-link">
          <img className="sidebar-brand-logo" src={logo} alt="" />
          <span className="sidebar-brand-text">Axiom</span>
        </Link>
      </div>

      <nav className="sidebar-body" aria-label={t("sidebar.menuLabel")}>
        <div className="sidebar-section-label">{t("sidebar.menuSection")}</div>
        {mainLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={() => linkClass(link.to)}
            end={link.to === "/home"}
          >
            <span className="sidebar-link-icon">
              <link.Icon {...iconProps} />
            </span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-link" title={t("sidebar.comingSoon")}>
          <span className="sidebar-link-icon">
            <FiLayers {...iconProps} />
          </span>
          {t("sidebar.templates")}
        </button>
        <button type="button" className="sidebar-link" title={t("sidebar.comingSoon")}>
          <span className="sidebar-link-icon">
            <FiSettings {...iconProps} />
          </span>
          {t("sidebar.settings")}
        </button>
      </div>
    </aside>
  );
}
