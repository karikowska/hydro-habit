// src/types.ts

// Existing HydrationContextType (ensure this matches your current one)
export interface HydrationContextType {
  goalError: string;
  drinkAmountError: string;
  fillPercentage: number;
  progressBarValue: number;
  drinkAmountPerClick: number;
  goalVsDrinkAmountError: string;
  hydrationState: UserHydrationData;

  handleDrink: () => void;
  handleGoalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGoalBlur: () => void;
  handleDrinkAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrinkAmountBlur: () => void;
  handleResetProgress: () => void;
  saveHydrationData: () => void;
}

// NEW: User and Auth Context Types
export interface User {
  username: string;
  loginString: string; // The "password" in your Streamlit demo
  createdAt: Date;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (username: string, loginString: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string) => Promise<{ success: boolean; message: string; loginString?: string }>;
  logout: () => void;
}

export interface UserHydrationData {
  username: string;
  currentWaterMl: number;
  dailyGoalMl: number;
  drinkAmountMl: number;
  goalInput?: string;
  drinkAmountInput?: string;
  createdAt?: Date;
  sipsTaken?: number;
}