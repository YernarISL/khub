import React from "react";
import EditButton from "../UI/EditButton/EditButton";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./ContinueWorking.css";

const ContinueWorking = ({ materials }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/materials/${latestOne[0].id}`);
    console.log(latestOne);
  };
  const latestOne = materials
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 1);

  return (
    <div className="continue-card-wrapper">
      <div className="continue-card-container">
        <div className="continue-card-left-section">
          <h2 className="continue-card-heading">{t("home.continueWorking")}</h2>
          <p className="continue-card-material-title">
            Document
          </p>
          <p>{t("home.lastOpened")}: 2 days ago</p>
          <button
            onClick={handleClick}
            style={{
              background: "#43C97C",
              border: "none",
              borderRadius: "12px",
              maxWidth: "120px",
              height: "30px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Click
          </button>
        </div>
        <div className="continue-card-right-section">
          <img
            src="src/assets/document_placeholder.jpg"
            alt="document image placeholder"
            className="document-image-placeholder"
          />
        </div>
      </div>
    </div>
  );
};

export default ContinueWorking;
