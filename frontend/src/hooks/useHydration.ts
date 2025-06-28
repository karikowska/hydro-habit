import { createContext, useContext } from "react";
import type { HydrationContextType } from "../type";

export const HydrationContext = createContext<HydrationContextType | undefined>(undefined);

export const useHydration = () => {
  const context = useContext(HydrationContext);
  if (context === undefined) {
    throw new Error('useHydration must be used within a HydrationProvider');
  }
  return context;
};