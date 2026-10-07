import { useEffect } from 'react';

export const useLockedBody = (locked: boolean = false) => {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [locked]);
};
