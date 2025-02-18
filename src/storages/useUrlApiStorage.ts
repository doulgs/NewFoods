import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const URL_KEY = "QUICKFOODS_PATH_URL";

interface UrlApiState {
  url: string | null;
  setUrl: (newURL: string) => Promise<void>;
  getUrl: () => Promise<void>;
  removeUrl: () => Promise<void>;
}

const useUrlApiStore = create<UrlApiState>((set) => ({
  url: null,

  // Salva a URL no AsyncStorage e atualiza o estado
  setUrl: async (newURL: string) => {
    try {
      await AsyncStorage.removeItem(URL_KEY);
      await AsyncStorage.setItem(URL_KEY, newURL);
      set({ url: newURL });
    } catch (error) {
      console.error("Error saving url to AsyncStorage:", error);
    }
  },

  // Busca a URL no AsyncStorage e atualiza o estado
  getUrl: async () => {
    try {
      const storedUrl = await AsyncStorage.getItem(URL_KEY);
      set({ url: storedUrl });
    } catch (error) {
      console.error("Error getting url from AsyncStorage:", error);
    }
  },

  // Remove a URL do AsyncStorage e atualiza o estado
  removeUrl: async () => {
    try {
      await AsyncStorage.removeItem(URL_KEY);
      set({ url: null });
    } catch (error) {
      console.error("Error removing url from AsyncStorage:", error);
    }
  },
}));

export { useUrlApiStore };
