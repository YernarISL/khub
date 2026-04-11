import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentUser } from "../services/userService";
import {
  getAllMaterials,
  getAllUserMaterials,
  getMaterialById,
} from "../services/materialService";
import { search } from "../services/searchService";
import { getUsers, getMaterials } from "../services/adminServise";

const useUsername = create((set) => ({
  username: "",
  setUsername: (username) => set({ username }),
}));

const useAuthStore = create(
  persist((set) => ({
    user: null,
    isAuth: false,
    isLoading: true,

    setAuth: (user) => set({ user, isAuth: true, isLoading: false }),
    clearAuth: () => set({ user: null, isAuth: false, isLoading: false }),
    setProfileImage: (profileImage) =>
      set((state) => ({ user: { ...state.user, profileImage } })),
  }))
);

const useCurrentUserStore = create((set) => ({
  user: null,
  fetchCurrentUser: async () => {
    const user = await getCurrentUser();
    set({ user });
  },
}));

const useMaterialStore = create((set) => ({
  userMaterials: [],
  allMaterials: [],
  material: null,

  fetchUserMaterials: async () => {
    const materials = await getAllUserMaterials();
    set({ userMaterials: materials });
  },

  fetchAllMaterials: async () => {
    const materials = await getAllMaterials();
    set({ allMaterials: materials });
  },

  fetchMaterialsById: async (id) => {
    const material = await getMaterialById(id);
    set({ material: material });
  },
}));

const useSearchStore = create((set) => ({
  searchTerm: "",
  data: { users: [], materials: [] },
  setSearchTerm: (value) => {
    set({ searchTerm: value });
  },
  setData: async (searchTerm) => {
    const data = await search(searchTerm);
    set({ data });
  },
}));

const useAdminStore = create((set) => ({
  users: [],
  materials: [],
  setUsers: async () => {
    const users = await getUsers();
    set({ users: users });
  },
  setMaterials: async () => {
    const materials = await getMaterials();
    set({ materials: materials });
  },
}));

export {
  useAuthStore,
  useUsername,
  useCurrentUserStore,
  useMaterialStore,
  useSearchStore,
  useAdminStore,
};
