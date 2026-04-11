import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./OpenSandboxButton.css";

const OpenSandboxButton = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <button className="open-sandbox-button" onClick={() => navigate("/sandbox")}>
      {t("home.openSandbox")}
    </button>
  );
};

export default OpenSandboxButton;
