import React, { useEffect } from 'react'
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore, useCurrentUserStore } from "./store";

const ProtectedRoute = () => {
  const { user, isAuth, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />
}

export default ProtectedRoute;