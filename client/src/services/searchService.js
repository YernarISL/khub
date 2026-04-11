import { host } from "./index";

export const search = async (query) => {
  const response = await host.get("/search", {
    params: { q: query },
    withCredentials: true
  });
  
  return response.data;
};
