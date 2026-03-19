import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  selectedUserId: number | null;
  setSelectedUserId: (id: number) => Promise<void>;
  loadStoredUser: () => Promise<void>;
}

const STORAGE_KEY = 'selectedUserId';

export const useAppStore = create<AppState>((set) => ({
  selectedUserId: null,

  setSelectedUserId: async (id: number) => {
    await AsyncStorage.setItem(STORAGE_KEY, String(id));
    set({ selectedUserId: id });
  },

  loadStoredUser: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      set({ selectedUserId: Number(stored) });
    }
  },
}));
