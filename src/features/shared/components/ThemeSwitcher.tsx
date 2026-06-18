import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
      className="px-3 py-1.5 text-xs font-medium text-brand-muted hover:text-[var(--clr-text)] border border-brand-border rounded-lg transition-all duration-200 flex items-center gap-1.5"
      aria-label={t('common.toggleTheme', { theme: nextTheme })}
      title={t('common.toggleTheme', { theme: nextTheme })}
    >
      {theme === 'dark' ? (
        <>
          <span className="text-brand-gold">☀</span>
          <span>{t('common.light')}</span>
        </>
      ) : (
        <>
          <span className="text-blue-400">☾</span>
          <span>{t('common.dark')}</span>
        </>
      )}
    </button>
  );
};
