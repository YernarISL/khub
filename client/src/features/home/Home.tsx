import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiBookOpen,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiMessageSquare,
  FiPlus,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

import MaterialCard from "@/components/MaterialCard/MaterialCard";
import { useCurrentUserStore, useMaterialStore } from "@/app/store";

import docThumbnail from "./assets/doc_thumbnail.png";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import type { HomeMaterial, HomeProfileUser } from "./types";
import {
  formatRelativeTime,
  materialFileBadge,
} from "./utils/formatRelativeTime";

import "./styles/home-page.css";

function sortMaterialsNewestFirst(materials: HomeMaterial[]): HomeMaterial[] {
  return [...materials].sort((a, b) => {
    const da = new Date(a.createdAt ?? a.publishedDate ?? 0).getTime();
    const db = new Date(b.createdAt ?? b.publishedDate ?? 0).getTime();
    return db - da;
  });
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const user = useCurrentUserStore(
    (state) => state.user,
  ) as HomeProfileUser | null;
  const fetchCurrentUser = useCurrentUserStore(
    (state) => state.fetchCurrentUser,
  );

  const materials = useMaterialStore(
    (state) => state.userMaterials,
  ) as HomeMaterial[];
  const fetchUserMaterials = useMaterialStore(
    (state) => state.fetchUserMaterials,
  );

  useEffect(() => {
    void fetchCurrentUser();
    void fetchUserMaterials();
  }, [fetchCurrentUser, fetchUserMaterials]);

  const sorted = useMemo(
    () => sortMaterialsNewestFirst(materials ?? []),
    [materials],
  );
  const latest = sorted[0];
  const recentThree = useMemo(() => sorted.slice(0, 3), [sorted]);
  const materialsPreview = useMemo(() => sorted.slice(0, 3), [sorted]);

  const lastOpenedLabel = formatRelativeTime(
    latest?.updatedAt ?? latest?.createdAt ?? latest?.publishedDate,
    i18n.language,
  );

  if (!user) {
    return (
      <div className="home-page">
        <div className="home-page-inner">
          <div className="home-page-loading">{t("home.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-page-inner">
        <div className="home-page-top">
          <div>
            <h1 className="home-page-greeting-title">
              {t("home.greeting")}, {user.firstName}
            </h1>
            <p className="home-page-greeting-sub">{t("home.dashboardHint")}</p>
          </div>

          <div className="home-page-stats">
            <div className="home-page-stat">
              <div className="home-page-stat-icon home-page-stat-icon--blue">
                <FiBookOpen size={16} aria-hidden />
              </div>
              <div>
                <p className="home-page-stat-label">
                  {t("home.papersReadLabel")}
                </p>
                <p className="home-page-stat-value">
                  {t("home.papersReadValue")}
                </p>
              </div>
            </div>
            <div className="home-page-stat home-page-stat--hide-sm">
              <div className="home-page-stat-icon home-page-stat-icon--green">
                <FiActivity size={16} aria-hidden />
              </div>
              <div>
                <p className="home-page-stat-label">{t("home.updatesLabel")}</p>
                <p className="home-page-stat-value">{t("home.updatesValue")}</p>
              </div>
            </div>
          </div>
        </div>

        <section
          className="home-page-section"
          aria-labelledby="home-research-heading"
        >
          <h2
            id="home-research-heading"
            className="home-page-section-title home-page-section-title--spaced"
          >
            {t("home.researchSectionTitle")}
          </h2>

          <div className="home-page-actions-grid">
            <Card className="home-page-actions-continue home-card--continue home-card--clickable">
              <CardContent className="home-continue-inner">
                <div className="home-continue-thumb">
                  <img
                    src={docThumbnail}
                    alt=""
                    className="home-continue-thumb-img"
                  />
                  <div className="home-continue-thumb-overlay" aria-hidden>
                    <FiExternalLink
                      className="home-continue-thumb-icon"
                      size={20}
                    />
                  </div>
                </div>
                <div className="home-continue-body">
                  <span className="home-continue-badge">
                    {t("home.continueTag")}
                  </span>
                  <h3 className="home-continue-title">
                    {latest?.title ?? t("home.noMaterialsTitle")}
                  </h3>
                  <div className="home-continue-meta">
                    <FiFileText size={12} aria-hidden />
                    <span>{t("home.documentKind")}</span>
                    {lastOpenedLabel ? (
                      <>
                        <span aria-hidden>•</span>
                        <FiClock size={12} aria-hidden />
                        <span>{lastOpenedLabel}</span>
                      </>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="success"
                    className="home-continue-open-btn"
                    disabled={!latest}
                    onClick={() => {
                      if (latest) navigate(`/materials/${latest.id}`);
                    }}
                  >
                    {t("home.openDocument")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="home-page-actions-start">
              <CardContent className="home-card-content home-card-content--start">
                <h3 className="home-start-title">{t("home.startNew")}</h3>
                <div className="home-start-stack">
                  <Button
                    variant="outline"
                    size="sm"
                    className="home-ui-btn--full"
                    onClick={() => navigate("/upload-pdf")}
                  >
                    <FiPlus
                      size={14}
                      className="home-ui-btn-icon-blue"
                      aria-hidden
                    />
                    {t("home.uploadPdf")}
                  </Button>
                  <Button
                    variant="softBlue"
                    size="sm"
                    className="home-ui-btn--full"
                    onClick={() => navigate("/sandbox")}
                  >
                    <span className="home-ui-btn-icon-wrap" aria-hidden>
                      <HiOutlineSparkles size={10} />
                    </span>
                    {t("home.openSandbox")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="home-page-actions-ai home-card--gradient home-card--ai">
              <div className="home-card-ai-blob" aria-hidden />
              <CardContent className="home-card-content">
                <div className="home-ai-head">
                  <div className="home-ai-icon-wrap">
                    <FiMessageSquare size={12} aria-hidden />
                  </div>
                  <span className="home-ai-brand">{t("home.axiomAi")}</span>
                </div>
                <h3 className="home-ai-title">{t("home.aiPromoTitle")}</h3>
                <p className="home-ai-text">{t("home.aiPromoBody")}</p>
                <Link to="/sandbox" className="home-ui-link-btn">
                  {t("home.askAiAgent")}
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          className="home-page-section"
          aria-labelledby="home-materials-heading"
        >
          <div className="home-page-section-head">
            <h2 id="home-materials-heading" className="home-page-section-title">
              {t("home.yourMaterials")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/myworks")}
            >
              {t("home.viewAll")}
            </Button>
          </div>

          <div className="materials-grid">
            {materialsPreview.map((material) => {
              const badge = materialFileBadge(material.materialType);
              const added = formatRelativeTime(
                material.createdAt ?? material.publishedDate,
                i18n.language,
              );
              const isUpload = material.materialType === "UPLOAD";
              return (
                <div
                  key={material.id}
                  className="home-material-card"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/materials/${material.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/materials/${material.id}`);
                    }
                  }}
                >
                  <div
                    className={
                      isUpload
                        ? "home-material-preview home-material-preview--thumb"
                        : "home-material-preview home-material-preview--icon"
                    }
                  >
                    {isUpload ? (
                      <img
                        src={docThumbnail}
                        alt=""
                        className="home-material-thumb-img"
                      />
                    ) : (
                      <FiFileText size={48} color="#93c5fd" aria-hidden />
                    )}
                    <span className="home-material-badge">{badge}</span>
                  </div>
                  <div className="home-material-body">
                    <h4 className="home-material-title">{material.title}</h4>
                    <p className="home-material-meta">
                      {added
                        ? t("home.materialAdded", { time: added })
                        : t("home.materialAddedUnknown")}
                    </p>
                  </div>
                </div>
              );
            })}

            <div
              className="home-upload-placeholder"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/upload-pdf")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/upload-pdf");
                }
              }}
            >
              <div className="home-upload-placeholder-icon">
                <FiPlus size={20} aria-hidden />
              </div>
              <span>{t("home.uploadMaterial")}</span>
            </div>
          </div>
        </section>

        <section
          className="home-page-recent"
          aria-labelledby="home-recent-heading"
        >
          <h2
            id="home-recent-heading"
            className="home-page-section-title home-page-section-title--spaced"
          >
            {t("home.recentlyAdded")}
          </h2>
          <div className="home-page-recent-inner">
            {recentThree.map((material) => (
              <MaterialCard material={material} key={material.id} />
            ))}
          </div>
        </section>

        <footer className="home-page-footer">
          <p>© 2026 KBTU Student. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
