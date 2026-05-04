import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/AnalyticsPage.css";

export default function AnalyticsPage() {
  const { t } = useTranslation();

  return (
    <div className="analytics-page">
      <h1 className="analytics-page-title">{t("sidebar.analyticsPageTitle")}</h1>
      <p className="analytics-page-lead">{t("sidebar.analyticsPageLead")}</p>
    </div>
  );
}
