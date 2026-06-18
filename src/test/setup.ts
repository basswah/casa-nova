import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';

afterEach(() => {
  cleanup();
});

beforeAll(async () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
  });

  // Initialize i18n for tests without LanguageDetector
  await i18n
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en }, ar: { translation: ar } },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
});