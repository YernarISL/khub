import React, { useEffect } from "react";
import { useSearchStore } from "../app/store";
import Header from "../components/Header/Header";
import MaterialCard from "../components/MaterialCard/MaterialCard";
import "../styles/SearchPage.css";

const SearchPage = () => {
  const searchTerm = useSearchStore((state) => state.searchTerm);

  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  const data = useSearchStore((state) => state.data);

  const setData = useSearchStore((state) => state.setData);

  useEffect(() => {
    if (searchTerm) {
      setData(searchTerm);
    }
  }, [searchTerm]);

  return (
    <div className="search-page-wrapper">
       <Header />
      <div className="search-container">
       
        <h1>Search in KHub</h1>
        {/* <div>
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        <select name="" id="">
          <option value="">Article</option>
          <option value="">Literature Review</option>
          <option value="">Theses</option>
          <option value="">Book</option>
          <option value="">Data</option>
        </select>
      </div> */}
        <div>
          {data.materials.map((material) => (
            <MaterialCard material={material} key={material.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
