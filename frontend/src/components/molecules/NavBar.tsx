'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Button } from '@/components/atoms/Button';
import { Avatar } from '@/components/atoms/Avatar';
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations, useLocale } from 'next-intl';

interface NavBarProps {
  className?: string;
}

export const NavBar: React.FC<NavBarProps> = ({ className }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const t = useTranslations('nav');
  const locale = useLocale();

  const navigation = user
    ? [
        { name: t('dashboard'), href: `/${locale}/dashboard/client` },
        { name: t('accounts'), href: `/${locale}/accounts` },
        { name: t('portfolio'), href: `/${locale}/portfolio` },
        { name: t('messages'), href: `/${locale}/messages` },
        { name: t('profile'), href: `/${locale}/profile` },
      ]
    : [
        { name: t('home'), href: `/${locale}` },
      ];

  return (
    <nav className={clsx('bg-white shadow-sm', className)}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-700 rounded flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl font-serif">A</span>
            </div>
            <div className="flex flex-col">
               <span className="font-display font-bold text-xl text-primary-900 leading-none">
                 Banque AVENIR
               </span>
               <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                 Particuliers
               </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {user ? (
              <>
                <Link href={`/${locale}/profile`}>
                  <Avatar
                    name={`${user.firstName} ${user.lastName}`}
                    size="sm"
                    status="online"
                  />
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`}>
                  <Button variant="outline" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button variant="primary" size="sm">
                    {t('register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'block px-4 py-2 rounded-lg text-sm font-medium',
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <button
                  className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('logout')}
                </button>
              ) : (
                <>
                  <Link
                    href={`/${locale}/login`}
                    className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    className="block px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
