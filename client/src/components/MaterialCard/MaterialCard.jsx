import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./MaterialCard.css";

const MaterialCard = ({ material }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/materials/${material.id}`)
  };

  return (
    <div onClick={handleClick} style={{ 
      border: '1px solid #ccc', 
      padding: '16px', 
      marginBottom: '16px',
      cursor: 'pointer'
    }}>
      <h3>{material.title}</h3>
      <p>{material.description}</p>
      <p>{material.user.firstName}</p>
      <small>{material.materialType}</small>
    </div>
  );
};

export default MaterialCard;