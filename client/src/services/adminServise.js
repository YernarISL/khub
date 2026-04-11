import { host } from "./index";

export const getUsers = async () => {
    const response = await host.get("/admin/users", {
        withCredentials: true
    })
    return response.data;
}

export const getMaterials = async () => {
  const response = await host.get("/admin/materials", {
    withCredentials: true
  });
  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await host.delete(`/admin/materials/${id}`, {
    withCredentials: true,
  });
  return response.data;
};
