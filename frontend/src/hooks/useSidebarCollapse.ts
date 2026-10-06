import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'sidebar:collapsed';
const MOBILE_QUERY = '(max-width: 639px)';

const readInitialState = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    // localStorage may be unavailable (private mode, disabled storage)
  }
  return window.matchMedia(MOBILE_QUERY).matches;
};

export const useSidebarCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(readInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    } catch {
      // Persisting is best-effort; state still works in memory
    }
  }, [isCollapsed]);

  const toggle = useCallback(() => setIsCollapsed((prev) => !prev), []);

  return { isCollapsed, toggle };
};
