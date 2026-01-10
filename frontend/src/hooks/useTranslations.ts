'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Translations = Record<string, any>;

export function useTranslations() {
  const router = useRouter();
  const pathname = usePathname();
  const [translations, setTranslations] = useState<Translations>({});
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    const loadTranslations = async () => {
      // Get locale from path or localStorage
      const pathLocale = pathname?.split('/')[1];
      const storedLocale = typeof window !== 'undefined' 
        ? localStorage.getItem('locale') 
        : null;
      
      const currentLocale = (pathLocale === 'en' ? 'en' : storedLocale || 'fr') as 'fr' | 'en';
      
      try {
        const response = await fetch(`/locales/${currentLocale}.json`);
        const data = await response.json();
        setTranslations(data);
        setLocale(currentLocale);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
  }, [pathname]);

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }

    if (typeof value !== 'string') return key;

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce(
        (acc, [paramKey, paramValue]) => 
          acc.replace(`{${paramKey}}`, paramValue),
        value
      );
    }

    return value;
  };

  const changeLocale = (newLocale: 'fr' | 'en') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
    
    // Update URL
    const currentPath = pathname?.replace(/^\/(fr|en)/, '') || '/';
    router.push(`/${newLocale}${currentPath}`);
  };

  return { t, locale, changeLocale };
}
