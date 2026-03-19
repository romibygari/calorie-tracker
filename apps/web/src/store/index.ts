import { create } from 'zustand';

interface AppState {
  selectedUserId: number | null;
  setSelectedUserId: (id: number) => void;
}

const STORAGE_KEY = 'selectedUserId';

export const useAppStore = create<AppState>(() => ({
  selectedUserId: localStorage.getItem(STORAGE_KEY) ? Number(localStorage.getItem(STORAGE_KEY)) : null,
  setSelectedUserId: (id: number) => {
    localStorage.setItem(STORAGE_KEY, String(id));
    useAppStore.setState({ selectedUserId: id });
  },
}));
