import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');

  const toggle = () => {
    i18n.changeLanguage(isAr ? 'en' : 'ar');
  };

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'en';
  }, [isAr]);

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 text-xs font-medium text-brand-muted hover:text-[var(--clr-text)] border border-brand-border rounded-lg transition-all duration-200"
      aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      {isAr ? 'EN' : 'AR'}
    </button>
  );
};
