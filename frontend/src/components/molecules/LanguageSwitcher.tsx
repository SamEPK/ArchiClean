'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clsx } from 'clsx';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.split('/')[1] === 'en' ? 'en' : 'fr';

  const switchLanguage = (locale: string) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, '');
    
    // Navigate to new locale
    const newPath = locale === 'fr' ? pathWithoutLocale : `/${locale}${pathWithoutLocale}`;
    router.push(newPath || '/');
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <button
        onClick={() => switchLanguage('fr')}
        className={clsx(
          'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
          currentLocale === 'fr'
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="Français"
      >
        🇫🇷 FR
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={clsx(
          'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
          currentLocale === 'en'
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="English"
      >
        🇬🇧 EN
      </button>
    </div>
  );
};
