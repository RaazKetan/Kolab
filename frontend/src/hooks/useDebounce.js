import { useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing function calls
 * Prevents multiple rapid executions of the same function
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {Function} Debounced function
 */
export const useDebounce = (callback, delay = 300) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * Custom hook for throttling function calls
 * Ensures function is called at most once per specified interval
 * Better for buttons that should only fire once
 * 
 * @param {Function} callback - The function to throttle
 * @param {number} delay - Minimum time between calls in milliseconds (default: 1000ms)
 * @returns {Function} Throttled function
 */
export const useThrottle = (callback, delay = 1000) => {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun.current;

    if (timeSinceLastRun >= delay) {
      // Execute immediately if enough time has passed
      callback(...args);
      lastRun.current = now;
    } else {
      // Schedule for later if called too soon
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - timeSinceLastRun);
    }
  }, [callback, delay]);
};

/**
 * Simple button click protection
 * Disables button for specified duration after click
 * 
 * @param {Function} callback - The function to call
 * @param {number} cooldown - Cooldown period in milliseconds (default: 1000ms)
 * @returns {Object} { handleClick, isDisabled }
 */
export const useButtonCooldown = (callback, cooldown = 1000) => {
  const isDisabled = useRef(false);

  const handleClick = useCallback((...args) => {
    if (isDisabled.current) return;
    
    isDisabled.current = true;
    callback(...args);
    
    setTimeout(() => {
      isDisabled.current = false;
    }, cooldown);
  }, [callback, cooldown]);

  return { handleClick, isDisabled: isDisabled.current };
};
