import React, { useEffect, useMemo, useState } from "react";
import { useMaterialStore } from "../app/store";
import MaterialCard from "../components/MaterialCard/MaterialCard";
import "../styles/UsersMaterials.css";

const UsersMaterials = () => {
  const materials = useMaterialStore((state) => state.userMaterials);
  const setMaterials = useMaterialStore((state) => state.fetchUserMaterials);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    setMaterials();
  }, [setMaterials]);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = [
      ...new Set(materials.map((material) => material.materialCategory).filter(Boolean)),
    ];

    return ["ALL", ...uniqueCategories];
  }, [materials]);

  const stats = useMemo(() => {
    const uploadsCount = materials.filter(
      (material) => material.materialType === "UPLOAD"
    ).length;
    const editorCount = materials.filter(
      (material) => material.materialType === "EDITOR"
    ).length;

    return {
      total: materials.length,
      uploadsCount,
      editorCount,
    };
  }, [materials]);

  const filteredAndSortedMaterials = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredMaterials = materials.filter((material) => {
      const titleMatch = material.title?.toLowerCase().includes(normalizedSearch);
      const descriptionMatch = material.description
        ?.toLowerCase()
        .includes(normalizedSearch);
      const categoryMatch =
        activeCategory === "ALL" || material.materialCategory === activeCategory;

      return categoryMatch && (titleMatch || descriptionMatch);
    });

    return filteredMaterials.sort((firstMaterial, secondMaterial) => {
      if (sortOption === "az") {
        return firstMaterial.title.localeCompare(secondMaterial.title);
      }

      if (sortOption === "za") {
        return secondMaterial.title.localeCompare(firstMaterial.title);
      }

      if (sortOption === "oldest") {
        return (
          new Date(firstMaterial.publishedDate).getTime() -
          new Date(secondMaterial.publishedDate).getTime()
        );
      }

      return (
        new Date(secondMaterial.publishedDate).getTime() -
        new Date(firstMaterial.publishedDate).getTime()
      );
    });
  }, [materials, searchTerm, sortOption, activeCategory]);

  return (
    <section className="materials-page-wrapper">
      <header className="materials-page-header">
        <div className="materials-page-header-text">
          <h1 className="materials-page-title">Your knowledge library</h1>
          <p className="materials-page-subtitle">
            Explore, filter, and open your teaching and research materials faster.
          </p>
        </div>

        <div className="materials-page-stats">
          <article className="materials-page-stat-card">
            <span className="materials-page-stat-label">Total materials</span>
            <strong className="materials-page-stat-value">{stats.total}</strong>
          </article>
          <article className="materials-page-stat-card">
            <span className="materials-page-stat-label">Uploads</span>
            <strong className="materials-page-stat-value">{stats.uploadsCount}</strong>
          </article>
          <article className="materials-page-stat-card">
            <span className="materials-page-stat-label">Editor docs</span>
            <strong className="materials-page-stat-value">{stats.editorCount}</strong>
          </article>
        </div>
      </header>

      <div className="materials-page-controls">
        <div className="materials-page-search-wrap">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="materials-page-search"
            placeholder="Search by title or description"
          />
        </div>

        <div className="materials-page-sort-wrap">
          <label htmlFor="materials-sort" className="materials-page-sort-label">
            Sort
          </label>
          <select
            id="materials-sort"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
            className="materials-page-sort"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">Title A-Z</option>
            <option value="za">Title Z-A</option>
          </select>
        </div>

        <div className="materials-page-view-switcher">
          <button
            type="button"
            className={`materials-page-view-btn ${
              viewMode === "grid" ? "materials-page-view-btn-active" : ""
            }`}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>
          <button
            type="button"
            className={`materials-page-view-btn ${
              viewMode === "list" ? "materials-page-view-btn-active" : ""
            }`}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
      </div>

      <div className="materials-page-category-chips">
        {categoryOptions.map((categoryOption) => (
          <button
            key={categoryOption}
            type="button"
            className={`materials-page-chip ${
              activeCategory === categoryOption ? "materials-page-chip-active" : ""
            }`}
            onClick={() => setActiveCategory(categoryOption)}
          >
            {categoryOption === "ALL" ? "All categories" : categoryOption}
          </button>
        ))}
      </div>

      {filteredAndSortedMaterials.length > 0 ? (
        <div
          className={`materials-page-grid ${
            viewMode === "list" ? "materials-page-grid-list" : ""
          }`}
        >
          {filteredAndSortedMaterials.map((material) => (
            <MaterialCard material={material} key={material.id} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="materials-page-empty-state">
          <h3>No materials found</h3>
          <p>Try changing search, category, or sort settings.</p>
        </div>
      )}
    </section>
  );
};

export default UsersMaterials;