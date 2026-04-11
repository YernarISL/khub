import React, { useEffect } from "react";
import { useAdminStore } from "../../../app/store";
import { deleteMaterial } from "../../../services/adminServise";
import "./AdminMaterials.css";

const AdminMaterials = () => {
  const materials = useAdminStore((state) => state.materials);
  const setMaterials = useAdminStore((state) => state.setMaterials);

  useEffect(() => {
    setMaterials();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert("Failed to delete material");
    }
  };

  const getFormatted = (date) => {
    const formatted = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
    return formatted;
  };

  return (
    <div className="admin-table-wrapper">
      <h2>Materials</h2>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Created</th>
              <th className="btn-th"></th>
            </tr>
          </thead>

          <tbody>
            {materials.map((material) => (
              <tr key={material.id}>
                <td>{material.id}</td>
                <td>
                  <div className="title">{material.title}</div>
                  <div className="subtitle">{material.materialCategory}</div>
                </td>
                <td>{`${material.user.firstName} ${material.user.secondName}`}</td>
                <td>{getFormatted(material.createdAt)}</td>
                <td className="btn-td">
                  <button className="btn btn-danger" onClick={() => handleDelete(material.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMaterials;
