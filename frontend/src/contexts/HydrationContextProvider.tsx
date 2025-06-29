import React, { useState, type ReactNode, useEffect, useCallback } from 'react';
import type { HydrationContextType, UserHydrationData } from '../type';
import { useAuth } from '../hooks/useAuth';
import { HydrationContext } from '../hooks/useHydration';

// 3. Create the Provider component
interface HydrationProviderProps {
    children: ReactNode;
}

// Define the localStorage key for ALL hydration data
const ALL_HYDRATION_DATA_KEY = 'HydroHomie_all_users_hydration_data';

export const HydrationProvider: React.FC<HydrationProviderProps> = ({ children }) => {
    const { currentUser, isAuthenticated } = useAuth(); // Get current user from AuthContext
    const [hydrationState, setHydrationState] = useState<UserHydrationData>({
        username: currentUser?.username ?? 'guest',
        currentWaterMl: 0,
        dailyGoalMl: 2000,
        goalInput: '2000',
        drinkAmountMl: 250,
        drinkAmountInput: '250',
        sipsTaken: 0,
    });

    // Destructure for easier use
    const {
        currentWaterMl,
        dailyGoalMl,
        drinkAmountMl,
    } = hydrationState;

    // State for errors (these are not persisted, as they are transient UI feedback)
    const [goalError, setGoalError] = useState('');
    const [drinkAmountError, setDrinkAmountError] = useState('');
    const [goalVsDrinkAmountError, setGoalVsDrinkAmountError] = useState('');


    // Helper to get all hydration data from localStorage
    const getAllHydrationData = (): UserHydrationData[] => {
        try {
            const storedData = localStorage.getItem(ALL_HYDRATION_DATA_KEY);
            return storedData ? JSON.parse(storedData) : [];
        } catch (e) {
            console.error("Failed to load all hydration data from localStorage", e);
            return [];
        }
    };

    // Load hydration data when auth state changes and update state conditionally
    useEffect(() => {
        // console.log('HydrationProvider: Auth state changed or mounted. Attempting to load data...');
        let loadedHydrationData: typeof hydrationState;

        // Inline the logic of getAllHydrationData to avoid function dependency
        const getAllHydrationData = (): UserHydrationData[] => {
            try {
                const storedData = localStorage.getItem(ALL_HYDRATION_DATA_KEY);
                return storedData ? JSON.parse(storedData) : [];
            } catch (e) {
                console.error("Failed to load all hydration data from localStorage", e);
                return [];
            }
        };

        if (isAuthenticated && currentUser) {
            const allHydrationData = getAllHydrationData();
            const userData = allHydrationData.find(data => data.username === currentUser.username);

            if (userData) {
                loadedHydrationData = {
                    username: userData.username,
                    currentWaterMl: userData.currentWaterMl || 0,
                    dailyGoalMl: userData.dailyGoalMl || 2000,
                    goalInput: String(userData.dailyGoalMl) || '2000',
                    drinkAmountMl: userData.drinkAmountMl || 250,
                    drinkAmountInput: String(userData.drinkAmountMl) || '250',
                    sipsTaken: userData.sipsTaken || 0,
                };
                // console.log(`HydrationProvider: Found and loaded data candidate for ${currentUser.username}:`, loadedHydrationData);
            } else {
                // Logged in, but no existing data for this user (e.g., brand new user)
                loadedHydrationData = {
                    username: currentUser.username,
                    currentWaterMl: 0,
                    dailyGoalMl: 2000,
                    goalInput: '2000',
                    drinkAmountMl: 250,
                    drinkAmountInput: '250',
                    sipsTaken: 0,
                };
                // console.log(`HydrationProvider: No existing data for ${currentUser.username}. Setting defaults:`, loadedHydrationData);
            }
        } else {
            // Not authenticated or no current user (e.g., logged out or guest)
            loadedHydrationData = {
                username: 'guest',
                currentWaterMl: 0,
                dailyGoalMl: 2000,
                goalInput: '2000',
                drinkAmountMl: 250,
                drinkAmountInput: '250',
                sipsTaken: 0,
            };
        }

        // FIX: Use the functional update form of setHydrationState directly returning the new state.
        // React will optimize and skip an update/re-render if the returned object is referentially
        // equal to the current state, or if a shallow comparison of its properties determines no change.
        setHydrationState(loadedHydrationData);

        // Always clear transient errors whenever user/auth state changes
        setGoalError('');
        setDrinkAmountError('');
        setGoalVsDrinkAmountError('');
    }, [isAuthenticated, currentUser]);

    // Save hydration data to localStorage only when explicitly called (e.g., on logout)
    const saveCurrentHydrationData = useCallback(() => {
        if (isAuthenticated && currentUser) {
            const dataToSave: UserHydrationData = {
                username: currentUser.username,
                currentWaterMl: hydrationState.currentWaterMl,
                dailyGoalMl: hydrationState.dailyGoalMl,
                drinkAmountMl: hydrationState.drinkAmountMl,
                sipsTaken: hydrationState.sipsTaken,
            };

            const allHydrationData = getAllHydrationData(); // Get the latest full list
            const existingUserIndex = allHydrationData.findIndex(data => data.username === currentUser.username);

            let updatedHydrationData: UserHydrationData[];
            if (existingUserIndex !== -1) {
                updatedHydrationData = [...allHydrationData];
                updatedHydrationData[existingUserIndex] = dataToSave;
            } else {
                updatedHydrationData = [...allHydrationData, dataToSave];
            }

            try {
                localStorage.setItem(ALL_HYDRATION_DATA_KEY, JSON.stringify(updatedHydrationData));
            } catch (e) {
                console.error("HydrationProvider: Error saving all hydration data to localStorage on explicit call:", e);
            }
        } else {
            console.error('HydrationProvider: Cannot save. Not authenticated or no current user.');
        }
    }, [isAuthenticated, currentUser, hydrationState, getAllHydrationData]);


    // Calculations (remain the same)
    const fillPercentage = Math.min(100, dailyGoalMl > 0 ? (currentWaterMl / dailyGoalMl) * 100 : 0);
    const progressBarValue = fillPercentage;

    // Helper for cross-field validation
    const validateGoalVsDrinkAmount = (currentGoal: number, currentDrinkAmount: number) => {
        if (currentGoal > 0 && currentDrinkAmount > 0 && currentGoal < currentDrinkAmount) {
            setGoalVsDrinkAmountError('Daily Goal cannot be less than Drink Amount.');
        } else {
            setGoalVsDrinkAmountError('');
        }
    };

    // Handlers
    const handleDrink = () => {
        setHydrationState(prev => ({
            ...prev,
            currentWaterMl: Math.min(dailyGoalMl, prev.currentWaterMl + drinkAmountMl),
            sipsTaken: (prev.sipsTaken || 0) + 1,
        }));
    };

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = Number(value);
        let newDailyGoal = 0;

        setHydrationState(prev => ({ ...prev, goalInput: value }));
        setGoalError(''); // Clear immediate input error

        if (value.trim() === '') {
            setGoalError('Goal cannot be empty');
        } else if (isNaN(numValue)) {
            setGoalError('Please enter a valid number');
        } else if (numValue <= 0) {
            setGoalError('Please enter a positive number');
        } else {
            newDailyGoal = numValue;
        }
        setHydrationState(prev => ({ ...prev, dailyGoalMl: newDailyGoal }));
        validateGoalVsDrinkAmount(newDailyGoal, drinkAmountMl);
    };

    const handleGoalBlur = () => {
        const numValue = Number(hydrationState.goalInput); // Use current input value
        let newDailyGoal = 0;
        if ((hydrationState.goalInput ?? '').trim() === '') {
            setGoalError('Goal cannot be empty');
        } else if (isNaN(numValue) || numValue <= 0) {
            setGoalError('Please enter a positive number');
        } else {
            newDailyGoal = numValue;
        }
        setHydrationState(prev => ({ ...prev, dailyGoalMl: newDailyGoal }));
        validateGoalVsDrinkAmount(newDailyGoal, hydrationState.drinkAmountMl);
    };

    const handleDrinkAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = Number(value);
        let newDrinkAmount = 0;

        setHydrationState(prev => ({ ...prev, drinkAmountInput: value }));
        setDrinkAmountError(''); // Clear immediate input error

        if (value.trim() === '') {
            setDrinkAmountError('Amount cannot be empty');
        } else if (isNaN(numValue)) {
            setDrinkAmountError('Please enter a valid number');
        } else if (numValue <= 0) {
            setDrinkAmountError('Please enter a positive amount');
        } else {
            newDrinkAmount = numValue;
        }
        setHydrationState(prev => ({ ...prev, drinkAmountMl: newDrinkAmount }));
        validateGoalVsDrinkAmount(dailyGoalMl, newDrinkAmount);
    };

    const handleDrinkAmountBlur = () => {
        const numValue = Number(hydrationState.drinkAmountInput); // Use current input value
        let newDrinkAmount = 0;
        if ((hydrationState.drinkAmountInput ?? '').trim() === '') {
            setDrinkAmountError('Amount cannot be empty');
        } else if (isNaN(numValue) || numValue <= 0) {
            setDrinkAmountError('Please enter a positive amount');
        } else {
            newDrinkAmount = numValue;
        }
        setHydrationState(prev => ({ ...prev, drinkAmountMl: newDrinkAmount }));
        validateGoalVsDrinkAmount(hydrationState.dailyGoalMl, newDrinkAmount);
    };

    const handleResetProgress = () => {
        setHydrationState(prev => ({ ...prev, currentWaterMl: 0, sipsTaken: 0 }));
        setGoalVsDrinkAmountError('');
    };

    const contextValue: HydrationContextType = {
        goalError,
        drinkAmountError,
        fillPercentage,
        progressBarValue,
        drinkAmountPerClick: drinkAmountMl,
        goalVsDrinkAmountError,
        hydrationState,

        handleDrink,
        handleGoalChange,
        handleGoalBlur,
        handleDrinkAmountChange,
        handleDrinkAmountBlur,
        handleResetProgress,
        saveHydrationData: saveCurrentHydrationData,
    };

    return (
        <HydrationContext.Provider value={contextValue}>
            {children}
        </HydrationContext.Provider>
    );
};