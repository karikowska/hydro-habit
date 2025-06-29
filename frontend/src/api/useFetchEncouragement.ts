// src/hooks/useFetchEncouragement.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from './api'; 

const ENCOURAGEMENT_CACHE_KEY = 'encouragement_cache';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface CachedEncouragement {
  data: string;
  timestamp: number;
}

interface EncouragementResponse {
    response: string; 
}

interface UseFetchEncouragementResult {
  data: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void; 
}

export const useFetchEncouragement = (): UseFetchEncouragementResult => {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0); // Used to trigger manual refetch

  const fetchEncouragement = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setData(null); 

    // Check for cached data
    const cachedItem = localStorage.getItem(ENCOURAGEMENT_CACHE_KEY);
    if (cachedItem) {
      try {
        const { data: cachedData, timestamp: cachedTimestamp }: CachedEncouragement = JSON.parse(cachedItem);
        const isCacheValid = (new Date().getTime() - cachedTimestamp) < CACHE_DURATION_MS;

        if (isCacheValid) {
          setData(cachedData);
          setIsLoading(false);
          return; // Exit if cache is valid
        }
      } catch (e) {
        console.error("Failed to parse cache, fetching new data.", e);
        localStorage.removeItem(ENCOURAGEMENT_CACHE_KEY);
      }
    }

    try {
      const response = await api.get<EncouragementResponse>(`/encouragement`);

      if (response.data && response.data.response) {
        localStorage.setItem(ENCOURAGEMENT_CACHE_KEY, JSON.stringify({ data: response.data.response, timestamp: new Date().getTime() }));
        setData(response.data.response);
      } else {
        throw new Error("API response format incorrect or response missing.");
      }
    } catch (err) {
      console.error("Error fetching hydration encouragement:", err);
      if (axios.isAxiosError(err) && err.response) {
        // More detailed error from backend
        setError(`Error: ${err.response.data.detail || err.message}`);
      } else {
        // Generic error
        setError(`Failed to fetch prompt: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  // Effect to run the fetch function when the component mounts or refetch is triggered
  useEffect(() => {
    fetchEncouragement();
  }, [fetchEncouragement, refetchIndex]); // Add refetchIndex to dependencies

  // Function to manually refetch the data
  const refetch = useCallback(() => {
    localStorage.removeItem(ENCOURAGEMENT_CACHE_KEY); // Invalidate cache on manual refetch
    setRefetchIndex(prev => prev + 1); // Trigger useEffect
  }, []);

  return { data, isLoading, error, refetch };
};