import { useState, useCallback } from 'react';
import { fetchPropertyData } from '../services/api';

export function usePropertyData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProperty = useCallback(async (url) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchPropertyData(url);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch property data');
      }
      return result.data;
    } catch (err) {
      const message = err.message || 'An unexpected error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, fetchProperty, clearError };
}
