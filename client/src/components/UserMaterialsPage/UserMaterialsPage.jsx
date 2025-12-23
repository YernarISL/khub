import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialCard from '../MaterialCard/MaterialCard';
import { getAllUserMaterials } from '../../services/materialService';

const UserMaterialsPage = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAllUsersMaterials();
  }, []);

  const setAllUsersMaterials = async () => {
    const data = await getAllUserMaterials();
    setMaterials(data);
  };

  const handleMaterialClick = (materialId) => {
    navigate(`/materials/${materialId}`);
  };

  return (
    <div className="">
      {materials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          onClick={handleMaterialClick}
        />
      ))}
    </div>
  );
};

export default UserMaterialsPage;