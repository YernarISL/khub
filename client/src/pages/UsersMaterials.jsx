import React, { useEffect } from 'react'
import { useMaterialStore } from '../app/store'
import MaterialCard from '../components/MaterialCard/MaterialCard'
import Header from '../components/Header/Header'
import "../styles/UsersMaterials.css"

const UsersMaterials = () => {
  const materials = useMaterialStore((state) => state.userMaterials);
  const setMaterials = useMaterialStore((state) => state.fetchUserMaterials);

  useEffect(() => {
    setMaterials();
  }, [])

  return (
    <div className="users-materials-page-wrapper">
      <Header />
      <h1 className="users-materials-page-heading">Your materials</h1>
      <div className="users-materials-page-container">
        {materials.map((material) => (
          <MaterialCard material={material} key={material.id}/>
        ))}  
      </div>
    </div>
  )
}

export default UsersMaterials;