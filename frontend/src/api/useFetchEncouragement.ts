import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from './api'; // Your Axios instance

interface EncouragementResponse {
  prompt: string; // Changed from 'response' to 'prompt' to match FastAPI output
}

interface CachedEncouragement {
  data: string;
  timestamp: number;
}

interface UseFetchEncouragementResult {
  data: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void; // Function to manually trigger a refetch
}

const ENCOURAGEMENT_CACHE_KEY = 'encouragement_cache';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes in milliseconds (adjust as needed)

export const useFetchEncouragement = (): UseFetchEncouragementResult => {
  // FIX: Initialize 'data' state directly from cache if valid
  const [data, setData] = useState<string | null>(() => {
    try {
      const cachedItem = localStorage.getItem(ENCOURAGEMENT_CACHE_KEY);
      if (cachedItem) {
        const { data: cachedData, timestamp: cachedTimestamp }: CachedEncouragement = JSON.parse(cachedItem);
        const isCacheValid = (new Date().getTime() - cachedTimestamp) < CACHE_DURATION_MS;
        if (isCacheValid) {
          console.log('useFetchEncouragement: Initializing from valid cache.');
          return cachedData;
        } else {
          console.log('useFetchEncouragement: Cache expired. Clearing cache.');
          localStorage.removeItem(ENCOURAGEMENT_CACHE_KEY); // Clear expired cache
        }
      }
    } catch (e) {
      console.error("useFetchEncouragement: Failed to read/parse cache on init.", e);
      localStorage.removeItem(ENCOURAGEMENT_CACHE_KEY); // Clear potentially corrupted cache
    }
    return null; // Default if no valid cache
  });

  // FIX: Initialize isLoading based on whether data was loaded from cache
  const [isLoading, setIsLoading] = useState<boolean>(!data); // If data is null, we are loading

  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0); // Used to trigger manual refetch

  const fetchEncouragement = useCallback(async () => {
    // Only set loading true if we actually need to fetch (i.e., not already loaded from cache)
    // If data is null OR we explicitly triggered a refetch, then we set loading
    if (data === null || refetchIndex > 0) { // Check if data is null or if a refetch was explicitly requested
        setIsLoading(true);
    }
    setError(null);

    // If data is already present from cache AND it's not a manual refetch,
    // we can skip the API call here. The 'data === null' check above is key.
    if (data !== null && refetchIndex === 0) {
      console.log('useFetchEncouragement: Data already present from cache, skipping API fetch for initial render.');
      setIsLoading(false); // Ensure loading is false if already cached
      return;
    }

    try {
      // The FastAPI endpoint is likely /get-hydration-prompt, based on your previous code
      const response = await api.get<EncouragementResponse>(`/encouragement`);

      if (response.data && response.data.prompt) {
        const newData = response.data.prompt;
        localStorage.setItem(ENCOURAGEMENT_CACHE_KEY, JSON.stringify({ data: newData, timestamp: new Date().getTime() }));
        setData(newData);
        console.log('useFetchEncouragement: Fetched and cached new prompt.');
      } else {
        throw new Error("API response format incorrect or prompt missing.");
      }
    } catch (err) {
      console.error("useFetchEncouragement: Error fetching hydration encouragement:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error: ${err.response.data.detail || err.message}`);
      } else {
        setError(`Failed to fetch prompt: ${err instanceof Error ? err.message : String(err)}`);
      }
      setData(null); // Clear data if fetch fails
    } finally {
      setIsLoading(false);
    }
  }, [data, refetchIndex]); // Added data and refetchIndex to dependencies to ensure correct logic flow


  useEffect(() => {
    fetchEncouragement();
  }, [fetchEncouragement]); // Only fetchEncouragement is needed as a dependency here.

  // Function to manually refetch the data
  const refetch = useCallback(() => {
    localStorage.removeItem(ENCOURAGEMENT_CACHE_KEY); // Invalidate cache on manual refetch
    setData(null); // Clear data to force loading state and re-fetch
    setRefetchIndex(prev => prev + 1); // Trigger useEffect
  }, []);

  return { data, isLoading, error, refetch };
};