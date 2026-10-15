import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from its previous value to `target` (ease-out cubic).
 * Runs on the JS thread at frame rate for `duration` ms — keep it to a few
 * headline numbers per screen.
 */
export function useCountUp(target: number, duration: number = 1200, enabled: boolean = true): number {
  const [value, setValue] = useState(enabled ? 0 : target);
  const fromRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !Number.isFinite(target)) {
      setValue(target);
      return;
    }

    const from = fromRef.current;
    const start = Date.now();

    function tick() {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      setValue(next);
      fromRef.current = next;

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, enabled]);

  return value;
}
