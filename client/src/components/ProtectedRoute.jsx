import React from 'react'
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store";

const ProtectedRoute = () => {
  const { isAuth, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />
}

export default ProtectedRoute;