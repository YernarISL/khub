import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store";

const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuth, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
