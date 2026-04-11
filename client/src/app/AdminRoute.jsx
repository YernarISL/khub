import React from "react";
import { useAuthStore } from "./store";
import { Outlet, Navigate } from "react-router-dom";

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
