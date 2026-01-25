'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true if the device primarily uses touch (e.g. phones, tablets).
 * Used to switch from drag-and-drop to Move Up/Down buttons on mobile.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsTouch(mq.matches);
    const listener = () => setIsTouch(mq.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  return isTouch;
}
