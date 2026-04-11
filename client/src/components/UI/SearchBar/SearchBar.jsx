import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../../../app/store";
import { useTranslation } from "react-i18next";
import searchIcon from "../../../assets/search_icon.svg";
import "./SearchBar.css";

const SearchBar = () => {
  const [inputValue, setInputValue] = useState("");

  const searchTerm = useSearchStore((state) => state.searchTerm);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  const setData = useSearchStore((state) => state.setData);

  const navigate = useNavigate();

  const { t } = useTranslation();

  const handleSearch = () => {
    setSearchTerm(inputValue);
    navigate("/search");
  };

  return (
    <div className="search-bar-container">
      <input
        className="search-bar"
        type="text"
        value={inputValue}
        placeholder={t("header.searchPlaceholder")}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button type="button" className="search-button" onClick={handleSearch}>
        <img src={searchIcon} alt="search icon" />
      </button>
    </div>
  );
};

export default SearchBar;
