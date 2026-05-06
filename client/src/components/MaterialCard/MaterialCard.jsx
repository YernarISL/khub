import React from "react";
import { useNavigate } from "react-router-dom";
import "./MaterialCard.css";

const MATERIAL_CATEGORY_LABELS = {
  ARTICLE: "Article",
  LR: "Literature Review",
  BOOK: "Book",
  THESES: "Theses",
  DATA: "Data",
};

const MATERIAL_TYPE_LABELS = {
  EDITOR: "Editor",
  UPLOAD: "Upload",
};

const MaterialCard = ({ material, viewMode = "grid" }) => {
  const navigate = useNavigate();

  const handleOpenMaterial = () => {
    navigate(`/materials/${material.id}`);
  };

  const handleCopyTitle = (event) => {
    event.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(material.title || "");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "No date";
    }

    return new Date(dateValue).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getEstimatedReadTime = (contentValue) => {
    const plainText =
      typeof contentValue === "string"
        ? contentValue
        : JSON.stringify(contentValue || "");
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 220));
    return `${minutes} min read`;
  };

  const materialCategoryLabel =
    MATERIAL_CATEGORY_LABELS[material.materialCategory] || "Uncategorized";
  const materialTypeLabel = MATERIAL_TYPE_LABELS[material.materialType] || "Material";

  return (
    <article
      className={`materials-card materials-card-${viewMode}`}
      onClick={handleOpenMaterial}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleOpenMaterial();
        }
      }}
    >
      <div className="materials-card-top">
        <span className="materials-card-badge">{materialCategoryLabel}</span>
        <span className="materials-card-type">{materialTypeLabel}</span>
      </div>

      <h3 className="materials-card-title">{material.title}</h3>
      <p className="materials-card-description">{material.description}</p>

      <div className="materials-card-meta">
        <span>{formatDate(material.publishedDate)}</span>
        <span>{getEstimatedReadTime(material.content)}</span>
      </div>

      <div className="materials-card-actions">
        <button
          type="button"
          className="materials-card-primary-btn"
          onClick={(event) => {
            event.stopPropagation();
            handleOpenMaterial();
          }}
        >
          Open material
        </button>
        <button
          type="button"
          className="materials-card-secondary-btn"
          onClick={handleCopyTitle}
        >
          Copy title
        </button>
      </div>
    </article>
  );
};

export default MaterialCard;