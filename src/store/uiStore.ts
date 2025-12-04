import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  activeModule: string;
  toggleSidebar: () => void;
  setActiveModule: (module: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeModule: 'dashboard',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setActiveModule: (module) => set({ activeModule: module }),
    }),
    {
      name: 'skybeam-ui',
    }
  )
);
