import React from 'react'
import { useTranslation } from 'react-i18next';
import OpenSandboxButton from "../UI/OpenSandboxButton/OpenSandboxButton";
import UploadPdfButton from "../UI/UploadPdfButton/UploadPdfButton"
import "./CreateNewSection.css";

const CreateNewSection = () => {
  const { t } = useTranslation();

  return (
    <div className="create-new-section-container">
      <h2 className="create-new-section-heading">{t("home.startNew")}</h2>
      <div className="create-new-sections-buttons">
        <UploadPdfButton />
        <OpenSandboxButton />
      </div>

    </div>
  )
}

export default CreateNewSection;