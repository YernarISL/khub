import React from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialCategory from '../MaterialCategory/MaterialCategory';
import EditButton from '../UI/EditButton/EditButton';
import DownloadButton from '../UI/DownloadButton/DownloadButton';
import "./MaterialCard.css";

const MaterialCard = ({ material }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/materials/${material.id}`)
  };

  return (
    <div className="material-card-container" onClick={handleClick}>
      <h3 className="material-card-title">{material.title}</h3>
      <div className="material-card-secondary-container">
        <MaterialCategory />
        <span>November 2025</span>
        <span>Reads: 120</span>
      </div>
      <div className="material-card-short-details">
        <p>Pages: 128</p>
        <p className="material-card-categories">Category: Digital Marketing, Marketing, Sociology</p>
      </div>
      <div className="material-card-buttons">
        <EditButton/>
        <DownloadButton/>
      </div>
    </div>
  );
};

export default MaterialCard;