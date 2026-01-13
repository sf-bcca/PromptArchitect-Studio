import { useCallback } from 'react';

/**
 * Custom hook for triggering haptic feedback (vibration) on supported devices.
 * Provides a set of predefined patterns for common interactions.
 */
export const useHaptics = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightImpact = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const mediumImpact = useCallback(() => {
    vibrate(20);
  }, [vibrate]);

  const heavyImpact = useCallback(() => {
    vibrate(50);
  }, [vibrate]);

  const successImpact = useCallback(() => {
    vibrate([10, 30, 10]);
  }, [vibrate]);

  const errorImpact = useCallback(() => {
    vibrate([50, 50, 50]);
  }, [vibrate]);

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    successImpact,
    errorImpact,
    vibrate
  };
};
