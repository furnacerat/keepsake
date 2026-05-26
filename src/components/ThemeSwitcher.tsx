import type { KeepsakeTheme } from '../theme/ThemeProvider';
import { useKeepsakeTheme } from '../theme/ThemeProvider';

const labels: Record<KeepsakeTheme, string> = {
  vintage: 'Vintage',
  modern: 'Modern',
  pastel: 'Pastel',
  bold: 'Bold',
};

export function ThemeSwitcher() {
  const { setTheme, theme, themes } = useKeepsakeTheme();

  return (
    <label className="ks-theme-switcher inline-flex shrink-0 items-center gap-2 rounded-full px-2 py-2 text-xs font-extrabold shadow-soft max-[380px]:hidden md:px-3">
      <span className="ks-theme-label hidden xl:inline">Theme</span>
      <select
        className="rounded-full px-2 py-1 text-xs font-extrabold outline-none focus:ring-2 focus:ring-keepsake-accent/35"
        aria-label="Theme"
        value={theme}
        onChange={(event) => setTheme(event.target.value as KeepsakeTheme)}
      >
        {themes.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
