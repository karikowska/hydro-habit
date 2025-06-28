// src/hooks/useFetchEncouragement.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from './api'; 

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

    try {
      // The FastAPI endpoint is likely /get-hydration-prompt, based on your previous code
      const response = await api.get<EncouragementResponse>(`/encouragement`);

      // Assuming FastAPI returns { "response": "..." }
      if (response.data && response.data.response) {
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
    setRefetchIndex(prev => prev + 1);
  }, []);

  return { data, isLoading, error, refetch };
};