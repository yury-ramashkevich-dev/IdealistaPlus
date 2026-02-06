import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'idealista-comparisons';
const DEBOUNCE_MS = 300;

export function useLocalStorage() {
  const [properties, setProperties] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [properties]);

  const addProperty = useCallback((property) => {
    setProperties(prev => {
      const exists = prev.some(p => p.url === property.url);
      if (exists) return prev;
      return [...prev, property];
    });
  }, []);

  const removeProperty = useCallback((url) => {
    setProperties(prev => prev.filter(p => p.url !== url));
  }, []);

  const clearAll = useCallback(() => {
    setProperties([]);
  }, []);

  return { properties, addProperty, removeProperty, clearAll };
}
