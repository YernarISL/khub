import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { host } from "../services";
import { fetchMaterialSummary } from "../services/materialService";
import Header from "../components/Header/Header";
import "../styles/MaterialDetails.css";

const MaterialDetails = () => {
  const { id } = useParams();
  const [summary, setSummary] = useState("");
  const navigate = useNavigate();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Загружаем материал при монтировании
  useEffect(() => {
    loadMaterial();
  }, [id]);

  const loadMaterial = async () => {
    try {
      setLoading(true);
      console.log("Загружаю материал ID:", id);

      // Используем твой endpoint для получения материала
      const response = await host.get(`/materials/${id}`, {
        withCredentials: true,
      });

      console.log("Материал загружен:", response.data);
      setMaterial(response.data);
      setError("");
    } catch (error) {
      console.error("Ошибка загрузки материала:", error);
      setError("Не удалось загрузить материал");
    } finally {
      setLoading(false);
    }
  };

  const handleGetSummary = async () => {
    setLoading(true);
    try {
      const result = await fetchMaterialSummary(id);
      setSummary(result);
    } catch (error) {
      alert("Не удалось получить краткое содержание");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Удалить этот материал?")) return;

    try {
      // Нужен endpoint для удаления
      await host.delete(`/material/${id}`, {
        withCredentials: true,
      });

      alert("Материал удален");
      navigate("/home"); // возвращаемся к списку
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить материал");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <div>Загрузка материала...</div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Материал не найден</h2>
        <p>{error || "Такого материала не существует"}</p>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "10px 20px",
            background: "#705df2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          ← Вернуться к материалам
        </button>
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div className="material-details">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <Link to="/home">Главная</Link> /<Link to="/myworks">Материалы</Link>{" "}
          /<span>{material.title}</span>
        </div>

        {/* Заголовок и действия */}
        <div className="material-header">
          <div className="material-title-section">
            <h1>{material.title}</h1>

            <div className="material-meta">
              <span className="material-type">
                {material.materialType === "UPLOAD" ? "PDF" : "Редактор"}
              </span>
              <span className="material-date">
                Дата: {formatDate(material.publishedDate)}
              </span>
              <span className="material-author">
                Автор: {material.user.firstName || "Неизвестный автор"}
              </span>
            </div>
          </div>

          <div className="material-actions">
            {/* <button onClick={handleDelete} className="btn btn-danger">
              Удалить
            </button> */}
            <button onClick={() => window.print()} className="btn-print">
              Печать
            </button>
          </div>
        </div>

        {/* Описание */}
        {material.description && (
          <div className="material-description">
            <h3>Описание</h3>
            <p>{material.description}</p>
          </div>
        )}

        {/* Контент материала */}
        <div className="material-content">
          <h3>Содержание</h3>
          <div
            className="content-html"
            dangerouslySetInnerHTML={{ __html: material.content }}
          />
        </div>

        {/* Метаданные (для PDF) */}
        {material.metadata && (
          <div className="material-metadata">
            <h3>Информация о файле</h3>
            <div className="metadata-grid">
              {material.metadata.originalFilename && (
                <div className="metadata-item">
                  <strong>Имя файла:</strong>
                  <span>{material.metadata.originalFilename}</span>
                </div>
              )}
              {material.metadata.fileSize && (
                <div className="metadata-item">
                  <strong>Размер:</strong>
                  <span>
                    {(material.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
              {material.metadata.uploadedAt && (
                <div className="metadata-item">
                  <strong>Загружен:</strong>
                  <span>{formatDate(material.metadata.uploadedAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Кнопки навигации */}
        <div className="navigation-buttons">
          <button onClick={() => navigate("/home")} className="btn-back">
            ← К списку материалов
          </button>

          {material.materialType === "UPLOAD" && (
            <button onClick={() => window.print()} className="btn btn-pdf">
              Скачать как PDF
            </button>
          )}
        </div>
        {/* <div className="ai-summary-content">
          <h3>AI Summary</h3>
          {!summary && !loading && (
            <button
              onClick={handleGetSummary}
              style={{ padding: "10px 20px", cursor: "pointer" }}
            >
              Generate summary
            </button>
          )}
          {loading && <p>Gemini анализирует документ...</p>}
          {summary && (
            <div
              className="summary-text"
              style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}
            >
              {summary}
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default MaterialDetails;
