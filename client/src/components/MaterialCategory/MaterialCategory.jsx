import React from "react";
import "./MaterialCategory.css";

const MaterialCategory = (material) => {
  const materialCategory = material.materialCategory;

  const defineMaterialCategory = () => {
    switch (materialCategory) {
      case "ARTICLE":
        return { title: "Article", color: "#B9F4D2" };
      case "LR":
        return { title: "Literature Review", color: "#b9d7f4ff" };
      case "BOOK":
        return { title: "Book", color: "#f4bcb9ff" };
      case "THESES":
        return { title: "Theses", color: "#f4dab9ff" };
      case "DATA":
        return { title: "Data", color: "#b9c1f4ff" };
      default:
        return null;
    }
  };
  if (!defineMaterialCategory()) {
    return (
      <div className="material-category-container" style={{ background: "#E9ECEF" }}>
        Not categorized
      </div>
    )
  } 
  return (
    <div
      className="material-category-container"
      style={{ background: defineMaterialCategory().color }}
    >
      {defineMaterialCategory().title}
    </div>
  ); 
};

export default MaterialCategory;
