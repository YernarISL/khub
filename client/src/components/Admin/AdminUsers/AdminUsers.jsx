import React, { useEffect, useState } from "react";
import { useAdminStore } from "../../../app/store";
import { updateUserRole } from "../../../services/adminServise";
import "./AdminUsers.css";

const AdminUsers = () => {
  const users = useAdminStore((state) => state.users);
  const setUsers = useAdminStore((state) => state.setUsers);
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setUsers();
  }, [setUsers]);

  const handleToggleManager = async (user) => {
    if (user.role === "ADMIN") return;
    const nextRole = user.role === "MANAGER" ? "USER" : "MANAGER";

    setLoadingUserId(user.id);
    setMessage("");
    try {
      await updateUserRole(user.id, nextRole);
      setMessage(`User ${user.username} updated to ${nextRole}`);
      await setUsers();
    } catch (error) {
      setMessage(error?.response?.data?.message ?? "Failed to update role.");
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="admin-table-wrapper">
      <h2>Users</h2>
      {message && <p className="admin-users-message">{message}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.role !== "ADMIN" ? (
                  <button
                    type="button"
                    className="admin-role-btn"
                    disabled={loadingUserId === user.id}
                    onClick={() => handleToggleManager(user)}
                  >
                    {loadingUserId === user.id
                      ? "Saving..."
                      : user.role === "MANAGER"
                        ? "Remove manager"
                        : "Make manager"}
                  </button>
                ) : (
                  <span className="admin-role-muted">Protected</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
