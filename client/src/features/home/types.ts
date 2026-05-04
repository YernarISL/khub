export type HomeMaterial = {
  id: number;
  title: string;
  description?: string;
  materialCategory?: string | null;
  materialType?: "EDITOR" | "UPLOAD";
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HomeProfileUser = {
  id: number;
  firstName: string;
  secondName?: string;
  username: string;
  role: string;
  email?: string;
  profileImage?: string | null;
};
