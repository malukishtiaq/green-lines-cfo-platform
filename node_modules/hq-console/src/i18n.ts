// i18n Configuration
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales
export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

// Check if locale is supported
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get locale from pathname
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const locale = segments[1];
  
  if (isValidLocale(locale)) {
    return locale;
  }
  
  return defaultLocale;
}

// Get pathname without locale
export function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split('/');
  const locale = segments[1];
  
  if (isValidLocale(locale)) {
    return '/' + segments.slice(2).join('/');
  }
  
  return pathname;
}

// RTL languages
export const rtlLanguages = ['ar'] as const;

// Check if language is RTL
export function isRTL(locale: Locale): boolean {
  return rtlLanguages.includes(locale as any);
}

// Get direction for locale
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

// Next-intl configuration
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!isValidLocale(locale)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Asia/Dubai', // UAE timezone
    now: new Date(),
  };
});
