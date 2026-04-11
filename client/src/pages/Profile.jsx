import { logout } from "../services/userService";
import { useAuthStore } from "../app/store";
import { useNavigate } from "react-router-dom";
import { uploadAvatar } from "../services/uploadAvatar";
import Header from "../components/Header/Header";
import "../styles/Profile.css";

const Profile = () => {
  const user = useAuthStore((state) => state.user);

  const setProfileImage = useAuthStore((state) => state.setProfileImage);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    clearAuth();
    navigate("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page-wrapper">
      <Header />
      <div className="profile-page-container">
        {user.profileImage && (
          <img
            src={`http://localhost:5000${user.profileImage}`}
            alt="avatar"
            className="profile-image"
          />
        )}
        <h3>{`${user.firstName} ${user.secondName}`}</h3>
        <p>Your ID: {user.id}</p>
        <p>Your email: {user.email}</p>
        <p>Your Role: {user.role}</p>
        <input
          className="select-profile-image-file-input"
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const data = await uploadAvatar(file);
            setProfileImage(data.profileImage);
          }}
        />
        <button className="logout-btn" onClick={handleLogout}>Click to logout</button>
      </div>
    </div>
  );
};

export default Profile;
