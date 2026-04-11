import { host } from "./index";

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  await host.post("/profile/avatar", formData, {
    withCredentials: true,
  });

  const response = await host.post("/profile/avatar", formData, {
    withCredentials: true,
  });

  return response.data;
};
