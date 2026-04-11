import React from "react";
import MaterialCard from "../MaterialCard/MaterialCard";
import "./RecentlyAddedSection.css";

const RecentlyAddedSection = ({ materials }) => {
  const latestThree = materials
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
  return (
    <div className="recently-added-container">
      {latestThree.map((material) => (
        <MaterialCard material={material} key={material.id}/>
      ))}
    </div>
  );
};

export default RecentlyAddedSection;
