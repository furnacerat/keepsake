import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

export type KeepsakeTheme = 'vintage' | 'modern' | 'pastel' | 'bold';

const STORAGE_KEY = 'keepsake.theme';
const themes: KeepsakeTheme[] = ['vintage', 'modern', 'pastel', 'bold'];

type ThemeContextValue = {
  theme: KeepsakeTheme;
  setTheme: (theme: KeepsakeTheme) => void;
  themes: KeepsakeTheme[];
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): KeepsakeTheme {
  if (typeof window === 'undefined') {
    return 'vintage';
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return themes.includes(storedTheme as KeepsakeTheme) ? (storedTheme as KeepsakeTheme) : 'vintage';
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<KeepsakeTheme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
      themes,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useKeepsakeTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useKeepsakeTheme must be used within ThemeProvider.');
  }

  return value;
}
