import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UploadPdfPage.css'; 

const UploadPdfPage = () => {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Пожалуйста, выберите именно PDF файл');
        setPdfFile(null);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB лимит
        setError('Файл слишком большой (макс. 10MB)');
        setPdfFile(null);
        return;
      }

      setPdfFile(file);
      setError('');
      
      // Автоматически подставляем название, если поле пустое
      if (!title) {
        setTitle(file.name.replace('.pdf', ''));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pdfFile) {
      setError('Выберите PDF файл');
      return;
    }
    
    if (!title.trim()) {
      setError('Введите название материала');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    // Подготовка данных для отправки
    const formData = new FormData();
    formData.append('pdfFile', pdfFile); // Ключ 'pdfFile' должен совпадать с upload.single('pdfFile') на бэкенде
    formData.append('title', title.trim());
    formData.append('description', description.trim() || 'Загруженный PDF документ');

    try {
      console.log('Отправка файла на сервер...');
      
      // Замените URL на ваш реальный адрес API
      const response = await axios.post('http://localhost:5000/api/material/upload-pdf', formData, {
        withCredentials: true, // Важно для передачи сессии
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Ответ сервера:', response.data);
      
      alert('PDF успешно загружен и обработан!');
      
      
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      const errorMessage = err.response?.data?.message || 'Ошибка при соединении с сервером';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  
  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>📄 Загрузить PDF материал</h1>
        <p>Загрузите PDF файл, и мы конвертируем его в редактируемый текст</p>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Название материала *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите материал"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pdfFile">PDF файл *</label>
            <div className="file-upload">
              <input
                type="file"
                id="pdfFile"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                required
              />
              {pdfFile && (
                <div className="file-info">
                  <span>📄 {pdfFile.name}</span>
                  <span>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>
            <small>Максимальный размер: 10MB</small>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="btn-cancel"
              disabled={isUploading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isUploading || !pdfFile}
              className="btn-submit-pdf"
            >
              {isUploading ? 'Загрузка и конвертация...' : 'Загрузить PDF'}
            </button>
          </div>
        </form>
        
        <div className="upload-info">
          <h3>Как это работает:</h3>
          <ul>
            <li>Выберите PDF файл (до 10MB)</li>
            <li>Система извлечет текст из PDF</li>
            <li>Текст будет сохранен как редактируемый материал</li>
            <li>Вы сможете редактировать его в текстовом редакторе</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPdfPage;