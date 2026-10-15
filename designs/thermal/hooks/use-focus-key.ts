import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Returns a counter that increments every time the screen gains focus.
 * Pass it to animations that should replay on each visit (scan sweep, focus lock).
 */
export function useFocusKey(): number {
  const [key, setKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setKey((value) => value + 1);
    }, []),
  );

  return key;
}
