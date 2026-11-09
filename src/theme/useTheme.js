import { useCallback, useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, getSystemTheme, storeTheme } from './theme.js';

/**
 * Current theme plus a toggle.
 *
 * Until the user picks a theme, the app follows the OS setting (and keeps
 * following it if the OS switches). Once they use the toggle, their choice
 * is saved and wins over the OS setting.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => getStoredTheme() ?? getSystemTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event) => {
      if (getStoredTheme() === null) setTheme(event.matches ? 'dark' : 'light');
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      storeTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
