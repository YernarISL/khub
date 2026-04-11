import React, { useEffect } from "react";
import { useAdminStore } from "../../../app/store";
import "./AdminUsers.css";

const AdminUsers = () => {
  const users = useAdminStore((state) => state.users);
  const setUsers = useAdminStore((state) => state.setUsers);

  useEffect(() => {
    setUsers();
  }, []);

  return (
    <div className="admin-table-wrapper">
      <h2>Users</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* AdminUsers
      {users.map((user) => (
        <div>
          <p>{user.id}</p>
          <p>{user.username}</p>
          <p>{user.email}</p>
          <p>{user.role}</p>
        </div>
      ))} */}
    </div>
  );
};

export default AdminUsers;
