import { host } from "./index";

export const getAllMaterials = async () => {
  const response = await host.get("/materials", { withCredentials: true });
  return response.data;
};

export const getAllUserMaterials = async () => {
  const response = await host.get("/user-all-materials", {
    withCredentials: true
  });
  return response.data;
};

export const getMaterialById = async (id) => {
  const response = await host.get(`/materials/${id}`, {
    withCredentials: true
  });
  return response.data;
}

export const createMaterial = async (materialData) => {
  console.log('Создаю материал с данными:', materialData);
  
  try {
    const response = await host.post("/material", materialData, {
      withCredentials: true
    });
    
    console.log('Успешный ответ от сервера:', response);
    console.log('response.data:', response.data);
    console.log('response.status:', response.status);
    
    return response.data;
    
  } catch (error) {
    console.error('Ошибка при создании материала:');
    console.error('Полный error объект:', error);
    console.error('Есть ли error.response?', !!error.response);
    
    if (error.response) {
      console.error('Статус:', error.response.status);
      console.error('Данные:', error.response.data);
      console.error('Заголовки:', error.response.headers);
    }
    
    if (error.request) {
      console.error('Запрос был сделан, но ответа нет:', error.request);
    }
    
    throw error;
  }
};