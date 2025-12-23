import { host } from "./index";

export const registration = async () => {};

export const login = async (credentials) => {
  const response = await host.post("/login", credentials, {
    withCredentials: true,
  });
  return response;
};

export const getCurrentUser = async () => {
  const response = await host.get("/me", {
    withCredentials: true,
  });

  return response.data;
};

export const logout = async () => {
  const response = await host.post("/logout", {
    withCredentials: true,
  });
  return response.data;
};
