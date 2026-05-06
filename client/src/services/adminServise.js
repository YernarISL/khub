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

export const updateUserRole = async (id, role) => {
  const response = await host.patch(
    `/admin/users/${id}/role`,
    { role },
    { withCredentials: true },
  );
  return response.data;
};

export const getRoleRequests = async (status = "PENDING") => {
  const response = await host.get(`/admin/role-requests?status=${encodeURIComponent(status)}`, {
    withCredentials: true,
  });
  return response.data;
};

export const approveRoleRequest = async (id) => {
  const response = await host.patch(
    `/admin/role-requests/${id}/approve`,
    {},
    { withCredentials: true },
  );
  return response.data;
};

export const rejectRoleRequest = async (id, reviewNote) => {
  const response = await host.patch(
    `/admin/role-requests/${id}/reject`,
    { reviewNote },
    { withCredentials: true },
  );
  return response.data;
};

export const getAnalyticsOverview = async () => {
  const response = await host.get("/admin/analytics/overview", {
    withCredentials: true,
  });
  return response.data;
};
