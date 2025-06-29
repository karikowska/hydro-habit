import { createContext, useContext } from "react";
import type { AuthContextType } from "../type";

// 1. Create the Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};