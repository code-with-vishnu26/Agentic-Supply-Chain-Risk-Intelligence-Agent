import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

/**
 * Custom hook for API calls with fallback to local data.
 * 
 * @param {string} endpoint - API endpoint (e.g., '/ingestion/events')
 * @param {object} options
 * @param {*} options.initialData - Initial data value
 * @param {Function} options.fallbackFn - Function that returns fallback data when API is unreachable
 * @param {boolean} options.skip - Skip the API call
 */
export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUsingFallback(false);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );
      
      // Race the API call against the timeout
      const result = await Promise.race([
        apiClient.get(endpoint),
        timeoutPromise
      ]);
      
      setData(result);
    } catch (err) {
      // If API fails, use fallback data
      if (options.fallbackFn) {
        const fallbackData = options.fallbackFn();
        setData(fallbackData);
        setIsUsingFallback(true);
        setError(null); // Don't show error when fallback works
      } else {
        setError(err.message || 'An error occurred fetching data');
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (options.skip) return;
    fetchData();
  }, [fetchData, options.skip]);

  return { data, loading, error, refetch: fetchData, isUsingFallback };
}
