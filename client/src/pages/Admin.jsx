import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "../styles/Admin.css";

const Admin = () => {
  const navigate = useNavigate();
  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-container">
        <div className="admin-page-navigation">
          <h1 className="admin-page-heading">Admin Panel</h1>
          <button className="admin-page-back-to-home-btn" onClick={() => navigate("/home")}>Back to home</button>
        </div>
        <div className="admin-page-links">
          <Link to="users" className="admin-users-link">Users</Link>
          <Link to="materials" className="admin-materials-link">Materials</Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
