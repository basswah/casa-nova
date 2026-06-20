import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SunIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-brand-gold">
    <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2Zm0 13a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15Zm-8-5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 2 10Zm13 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 15 10ZM4.343 4.343a.75.75 0 0 1 1.061 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06Zm9.193 9.193a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM4.343 15.657a.75.75 0 0 1 0-1.061l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0Zm9.193-9.193a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0ZM10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-400">
    <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clipRule="evenodd" />
  </svg>
);

export const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="px-2.5 py-1.5 text-xs font-medium text-brand-muted hover:text-brand-light border border-brand-border rounded-lg transition-all duration-200 flex items-center gap-1.5"
      aria-label={t('common.toggleTheme', { theme: nextTheme })}
      title={t('common.toggleTheme', { theme: nextTheme })}
    >
      {theme === 'dark' ? (
        <>
          <SunIcon />
          <span>{t('common.light')}</span>
        </>
      ) : (
        <>
          <MoonIcon />
          <span>{t('common.dark')}</span>
        </>
      )}
    </button>
  );
};
