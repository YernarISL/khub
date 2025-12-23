import React from "react";
import { logout } from "../services/userService";

const Profile = () => {
  const handleLogout = async () => {
    await logout();
    clearAuth();
    navigate("/login");
  };
  return (
    <div>
      Profile
      <button onClick={handleLogout}>Click to logout</button>
    </div>
  );
};

export default Profile;
