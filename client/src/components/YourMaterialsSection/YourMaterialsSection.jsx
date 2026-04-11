import React, { useEffect } from "react";
import { useMaterialStore } from "../../app/store";
import { Link } from "react-router-dom";
import ShortMaterialCard from "../ShortMaterialCard/ShortMaterialCard";
import "./YourMaterialsSection.css";

const YourMaterialsSection = () => {
  const userMaterials = useMaterialStore((state) => state.userMaterials);

  const fetchUserMaterials = useMaterialStore(
    (state) => state.fetchUserMaterials
  );

  useEffect(() => {
    fetchUserMaterials();
  }, []);

  if (!userMaterials) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="your-materials-section-container">
      <div className="your-materials-cards">
        {userMaterials.slice(0, 3).map((material) => (
          <ShortMaterialCard key={material.id} material={material} />
        ))}
      </div>
      <div className="your-materials-view-all">
        <Link className="your-materials-view-all-link">
          View all
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="12"
            viewBox="0 0 18 14"
            fill="none"
          >
            <path
              d="M10.0197 0.373061C10.2608 0.13419 10.5878 0 10.9287 0C11.2697 0 11.5966 0.13419 11.8378 0.373061L17.6236 6.10685C17.8646 6.34579 18 6.66983 18 7.00769C18 7.34556 17.8646 7.66959 17.6236 7.90853L11.8378 13.6423C11.5953 13.8744 11.2705 14.0029 10.9334 14C10.5963 13.997 10.2738 13.863 10.0354 13.6268C9.797 13.3906 9.66178 13.071 9.65885 12.7369C9.65592 12.4028 9.78552 12.081 10.0197 11.8406L13.5002 8.28187H1.28573C0.944736 8.28187 0.617705 8.14762 0.376583 7.90867C0.135461 7.66972 0 7.34562 0 7.00769C0 6.66976 0.135461 6.34567 0.376583 6.10671C0.617705 5.86776 0.944736 5.73352 1.28573 5.73352H13.5002L10.0197 2.17475C9.77869 1.9358 9.64328 1.61177 9.64328 1.2739C9.64328 0.936038 9.77869 0.612004 10.0197 0.373061Z"
              fill="#1C1C1E"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default YourMaterialsSection;
