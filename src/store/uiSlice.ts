import { type StateCreator } from "zustand";
import type { UISlice } from "@/types/store";

export const createUISlice: StateCreator<UISlice> = (set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
});
