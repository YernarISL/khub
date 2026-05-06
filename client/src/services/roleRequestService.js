import { host } from "./index";

export const createRoleRequest = async (payload) => {
  const response = await host.post("/role-requests", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const getMyRoleRequest = async () => {
  const response = await host.get("/role-requests/me", {
    withCredentials: true,
  });
  return response.data;
};

export const cancelRoleRequest = async (id) => {
  const response = await host.patch(`/role-requests/${id}/cancel`, {}, {
    withCredentials: true,
  });
  return response.data;
};
