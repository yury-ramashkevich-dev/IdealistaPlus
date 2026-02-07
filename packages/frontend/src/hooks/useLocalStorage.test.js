import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'idealista-comparisons';

const mockProperty = {
  url: 'https://www.idealista.com/inmueble/123/',
  title: 'Test Property',
  price: '300.000 €',
};

const mockProperty2 = {
  url: 'https://www.idealista.com/inmueble/456/',
  title: 'Second Property',
  price: '250.000 €',
};

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.properties).toEqual([]);
  });

  it('loads existing data from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([mockProperty]));
    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.properties).toEqual([mockProperty]);
  });

  it('handles corrupt JSON in localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json{{{');
    const { result } = renderHook(() => useLocalStorage());
    expect(result.current.properties).toEqual([]);
  });

  it('addProperty adds a new property', () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.addProperty(mockProperty);
    });

    expect(result.current.properties).toEqual([mockProperty]);
  });

  it('addProperty prevents duplicate URLs', () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.addProperty(mockProperty);
    });
    act(() => {
      result.current.addProperty(mockProperty);
    });

    expect(result.current.properties).toHaveLength(1);
  });

  it('addProperty allows different URLs', () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.addProperty(mockProperty);
    });
    act(() => {
      result.current.addProperty(mockProperty2);
    });

    expect(result.current.properties).toHaveLength(2);
  });

  it('removeProperty removes by URL', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([mockProperty, mockProperty2]));
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.removeProperty(mockProperty.url);
    });

    expect(result.current.properties).toEqual([mockProperty2]);
  });

  it('clearAll removes all properties', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([mockProperty, mockProperty2]));
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.properties).toEqual([]);
  });

  it('saves to localStorage after 300ms debounce', () => {
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.addProperty(mockProperty);
    });

    // Not saved yet
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // Advance past debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([mockProperty]);
  });

  it('multiple rapid changes cause only one save', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useLocalStorage());

    act(() => {
      result.current.addProperty(mockProperty);
    });
    act(() => {
      result.current.addProperty(mockProperty2);
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // setItem called once for the final state (after debounce settles)
    const calls = spy.mock.calls.filter(([key]) => key === STORAGE_KEY);
    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0][1])).toEqual([mockProperty, mockProperty2]);
  });
});
