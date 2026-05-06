import { useEffect, useState } from "react";
import { logout } from "../services/userService";
import { useAuthStore } from "../app/store";
import { useNavigate } from "react-router-dom";
import { uploadAvatar } from "../services/uploadAvatar";
import {
  cancelRoleRequest,
  createRoleRequest,
  getMyRoleRequest,
} from "../services/roleRequestService";
import "../styles/Profile.css";

const Profile = () => {
  const user = useAuthStore((state) => state.user);

  const setProfileImage = useAuthStore((state) => state.setProfileImage);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const navigate = useNavigate();
  const [requestState, setRequestState] = useState({
    requestedRole: "STUDENT",
    fullName: "",
    externalId: "",
  });
  const [roleRequest, setRoleRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);
  const [requestMessage, setRequestMessage] = useState("");

  const loadRoleRequest = async () => {
    setIsLoadingRequest(true);
    try {
      const data = await getMyRoleRequest();
      setRoleRequest(data);
    } catch (error) {
      console.error(error);
      setRequestMessage("Failed to load your role request.");
    } finally {
      setIsLoadingRequest(false);
    }
  };

  useEffect(() => {
    loadRoleRequest();
  }, []);

  const handleLogout = async () => {
    await logout();
    clearAuth();
    navigate("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const hasPendingRequest = roleRequest?.status === "PENDING";
  const requestStatusLabel = roleRequest ? roleRequest.status : "No request submitted";
  const requestStatusClassName = (roleRequest?.status ?? "no_request_submitted").toLowerCase();

  const handleRequestInput = (field) => (event) => {
    setRequestState((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleRoleRequestSubmit = async (event) => {
    event.preventDefault();
    setRequestMessage("");
    setIsSubmitting(true);
    try {
      await createRoleRequest({
        requestedRole: requestState.requestedRole,
        fullName: requestState.fullName,
        externalId: requestState.externalId,
      });
      setRequestMessage("Your request has been submitted for manager review.");
      await loadRoleRequest();
    } catch (error) {
      setRequestMessage(error?.response?.data?.message ?? "Unable to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!roleRequest?.id) return;
    setRequestMessage("");
    setIsSubmitting(true);
    try {
      await cancelRoleRequest(roleRequest.id);
      setRequestMessage("Pending request cancelled.");
      await loadRoleRequest();
    } catch (error) {
      setRequestMessage(error?.response?.data?.message ?? "Unable to cancel request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
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

      <section className="profile-identity-card">
        <div className="profile-identity-header">
          <h3>Identity mapping</h3>
          <span
            className={`profile-identity-status profile-identity-status--${requestStatusClassName}`}
          >
            {requestStatusLabel}
          </span>
        </div>

        {isLoadingRequest ? (
          <p className="profile-identity-muted">Loading request state...</p>
        ) : (
          <>
            <p className="profile-identity-muted">
              Request role approval to join your academic workflow as student or teacher.
            </p>

            {roleRequest && (
              <div className="profile-identity-request-meta">
                <p><strong>Requested role:</strong> {roleRequest.requestedRole}</p>
                <p><strong>Full name:</strong> {roleRequest.fullName}</p>
                <p><strong>ID:</strong> {roleRequest.externalId}</p>
                {roleRequest.reviewNote && <p><strong>Manager note:</strong> {roleRequest.reviewNote}</p>}
              </div>
            )}

            <form className="profile-identity-form" onSubmit={handleRoleRequestSubmit}>
              <label className="profile-identity-field">
                Requested role
                <select
                  value={requestState.requestedRole}
                  onChange={handleRequestInput("requestedRole")}
                  disabled={hasPendingRequest || isSubmitting}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </label>

              <label className="profile-identity-field">
                Full name
                <input
                  value={requestState.fullName}
                  onChange={handleRequestInput("fullName")}
                  placeholder="Damir Akhmetov"
                  disabled={hasPendingRequest || isSubmitting}
                  required
                />
              </label>

              <label className="profile-identity-field">
                Student ticket / ID
                <input
                  value={requestState.externalId}
                  onChange={handleRequestInput("externalId")}
                  placeholder="2024-05"
                  disabled={hasPendingRequest || isSubmitting}
                  required
                />
              </label>

              <div className="profile-identity-actions">
                <button
                  type="submit"
                  className="profile-identity-btn profile-identity-btn--primary"
                  disabled={hasPendingRequest || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit request"}
                </button>
                {hasPendingRequest && (
                  <button
                    type="button"
                    className="profile-identity-btn profile-identity-btn--danger"
                    disabled={isSubmitting}
                    onClick={handleCancelRequest}
                  >
                    Cancel pending request
                  </button>
                )}
              </div>
            </form>
          </>
        )}

        {requestMessage && <p className="profile-identity-message">{requestMessage}</p>}
      </section>
    </div>
  );
};

export default Profile;
