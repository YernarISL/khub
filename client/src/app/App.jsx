import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store";
import { getCurrentUser } from "../services/userService";
import Registration from "../pages/Registration";
import Login from "../pages/Login";
import Home from "../features/home/Home";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Profile";
import MaterialDetails from "../pages/MaterialDetails";
import SandboxPage from "../features/sandbox/SandboxPage";
import UploadPdfPage from "../pages/UploadPdfPage";
import Intro from "../pages/Intro";
import SearchPage from "../pages/SearchPage";
import Admin from "../pages/Admin";
import AdminMaterials from "../components/Admin/AdminMaterials/AdminMaterials";
import AdminUsers from "../components/Admin/AdminUsers/AdminUsers";
import AdminRoute from "./AdminRoute";
import UsersMaterials from "../pages/UsersMaterials";
import MainLayout from "../components/MainLayout/MainLayout";
import AnalyticsPage from "../pages/AnalyticsPage";
import RoleRoute from "./RoleRoute";
import { ROLES } from "../shared/constants/roles";
import TeacherDashboard from "../pages/TeacherDashboard";
import "./App.css";

function App() {

  const setAuth = useAuthStore((state) => state.setAuth);

  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setAuth(res))
      .catch(() => {
        clearAuth();
      });
  }, [clearAuth, setAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sandbox" element={<SandboxPage />} />
            <Route path="/myworks" element={<UsersMaterials />} />
            <Route path="/upload-pdf" element={<UploadPdfPage />} />
            <Route path="/materials/:id" element={<MaterialDetails />} />
            <Route path="/search" element={<SearchPage />} />

            <Route element={<RoleRoute allowedRoles={[ROLES.MANAGER]} />}>
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={[ROLES.TEACHER]} />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
            </Route>
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />}>
            <Route path="users" element={<AdminUsers />} />
            <Route path="materials" element={<AdminMaterials />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
