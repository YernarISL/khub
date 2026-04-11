import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "./UploadPdfButton.css";

const UploadPdfButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <button className="upload-pdf-button" onClick={() => navigate("/upload-pdf")}>
        {t("home.uploadPdf")}
    </button>
  )
}

export default UploadPdfButton;