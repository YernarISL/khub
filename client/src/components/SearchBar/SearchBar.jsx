import React from 'react'
import "./SearchBar.css";

const SearchBar = () => {
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar-container">
        <input className="search-bar" type="text" placeholder="Search for researches, people, journals etc..."/>
        <button className="search-button">Search</button>
      </div>
    </div>
  )
}

export default SearchBar