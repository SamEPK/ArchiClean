import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'fr'; // Default to French
  }

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    // Fallback to French if locale file not found
    messages = (await import('@/messages/fr.json')).default;
  }

  return {
    locale,
    messages
  };
});
