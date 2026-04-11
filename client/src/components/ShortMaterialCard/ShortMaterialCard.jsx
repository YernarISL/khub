import React from "react";
import { useNavigate } from "react-router-dom";
import MaterialCategory from "../MaterialCategory/MaterialCategory";
import "./ShortMaterialCard.css";

const ShortMaterialCard = ({ material }) => {
  const navigate = useNavigate();
  return (
    <div className="short-material-card-container">
      <h3 className="short-material-card-title">{material.title}</h3>
      <div className="short-material-card-secondary-container">
        <MaterialCategory />
        <span>November 2025</span>
      </div>
      <button className="in-details-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
        >
          <circle cx="16" cy="16" r="16" fill="#E9ECEF" />
          <path
            d="M17.0197 9.37306C17.2608 9.13419 17.5878 9 17.9287 9C18.2697 9 18.5966 9.13419 18.8378 9.37306L24.6236 15.1069C24.8646 15.3458 25 15.6698 25 16.0077C25 16.3456 24.8646 16.6696 24.6236 16.9085L18.8378 22.6423C18.5953 22.8744 18.2705 23.0029 17.9334 23C17.5963 22.997 17.2738 22.863 17.0354 22.6268C16.797 22.3906 16.6618 22.071 16.6589 21.7369C16.6559 21.4028 16.7855 21.081 17.0197 20.8406L20.5002 17.2819H8.28573C7.94474 17.2819 7.6177 17.1476 7.37658 16.9087C7.13546 16.6697 7 16.3456 7 16.0077C7 15.6698 7.13546 15.3457 7.37658 15.1067C7.6177 14.8678 7.94474 14.7335 8.28573 14.7335H20.5002L17.0197 11.1747C16.7787 10.9358 16.6433 10.6118 16.6433 10.2739C16.6433 9.93604 16.7787 9.612 17.0197 9.37306Z"
            fill="#1C1C1E"
          />
        </svg>
      </button>
    </div>
  );
};

export default ShortMaterialCard;
