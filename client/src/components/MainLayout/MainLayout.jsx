import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">
        <Header />
        <main className="app-shell-outlet" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
