import React from 'react'
import { useTranslation } from 'react-i18next';
import "./EditButton.css";

const EditButton = () => {
  const { t } = useTranslation();
  return (
    <div>
      <button className="edit-button">{t("home.editing")}</button>
    </div>
  )
}

export default EditButton;