import React, { useEffect } from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Home from "./pages/Home";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store";
import axios from "axios";
import { getCurrentUser } from "./services/userService";
import Profile from "./pages/Profile";
import MaterialDetails from "./pages/MaterialDetails";
import MaterialEditor from "./pages/MaterialEditor";
import UploadPdfPage from "./pages/UploadPdfPage";

function App() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setAuth(res))
      .catch(() => clearAuth);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sandbox" element={<MaterialEditor />} />
          <Route path="/upload-pdf" element={<UploadPdfPage />} />
          <Route path="/materials/:id" element={<MaterialDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
