import { create } from "zustand";
import { createUISlice } from "./uiSlice";
import { createAuthSlice } from "./authSlice";
import type { UISlice } from "@/types/store";
import type { AuthSlice } from "./authSlice";

export type StoreState = UISlice & AuthSlice;

export const useAppStore = create<StoreState>()((...a) => ({
  ...createUISlice(...a),
  ...createAuthSlice(...a),
}));