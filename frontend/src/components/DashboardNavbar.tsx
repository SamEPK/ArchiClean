'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Building2, 
  LogOut, 
  User, 
  Briefcase, 
  PieChart, 
  Settings, 
  Bell,
  Newspaper,
  MessageSquare
} from 'lucide-react';

export default function DashboardNavbar({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');

  const handleLogout = () => {
    logout();
    window.location.href = `/${locale}/login`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation Bar - Institutional Style */}
      <nav className="bg-primary-900 text-white shadow-md z-50">
        <div className="container-bank mx-auto flex justify-between items-center h-16 px-4">
          {/* Logo */}
          <Link href={user?.role === 'ADVISOR' ? `/${locale}/dashboard/advisor` : user?.role === 'DIRECTOR' ? `/${locale}/dashboard/director` : `/${locale}/dashboard/client`} className="flex items-center gap-2 group">
             <div className="bg-white/10 p-2 rounded group-hover:bg-white/20 transition-colors">
                <Building2 size={24} className="text-white" />
             </div>
             <span className="font-display font-bold text-xl tracking-wide">
                {tHome('title')}
             </span>
          </Link>

          {/* User Menu & Actions */}
          <div className="flex items-center gap-6">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 mr-2">
                 <Link href={pathname.replace(`/${locale}`, '/fr')} className={`text-sm font-bold transition-colors ${locale === 'fr' ? 'text-white' : 'text-primary-300 hover:text-white'}`}>FR</Link>
                 <span className="text-primary-600">|</span>
                 <Link href={pathname.replace(`/${locale}`, '/en')} className={`text-sm font-bold transition-colors ${locale === 'en' ? 'text-white' : 'text-primary-300 hover:text-white'}`}>EN</Link>
            </div>

            <Link 
              href={`/${locale}/feed`}
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors group"
              title="Actualités & Notifications"
            >
               <Bell size={20} className="text-primary-100 group-hover:text-white" />
               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary-500 rounded-full border-2 border-primary-900"></span>
            </Link>
            
            {isLoading ? (
              <div className="hidden md:flex items-center gap-3 pl-6 border-l border-primary-800">
                <div className="flex flex-col items-end gap-1">
                  <div className="w-24 h-3 bg-primary-700 rounded animate-pulse"></div>
                  <div className="w-16 h-2 bg-primary-700 rounded animate-pulse"></div>
                </div>
                <div className="w-10 h-10 bg-primary-700 rounded-full animate-pulse border border-primary-600"></div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3 pl-6 border-l border-primary-800">
                <div className="flex flex-col items-end">
                  <span className="font-bold text-sm leading-none">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-primary-200 uppercase tracking-wider">{user?.role}</span>
                </div>
                <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center border border-primary-600">
                  <User size={20} />
                </div>
              </div>
            )}

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-primary-200 hover:text-white transition-colors ml-4"
            >
               <LogOut size={18} />
               <span className="hidden md:inline">{tCommon('logout')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation (Tabs) */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container-bank mx-auto px-4">
           <div className="flex gap-1 overflow-x-auto">
              {(!user?.role || user?.role === 'CLIENT' || user?.role === 'USER') && (
                <>
                  <NavLink href={`/${locale}/dashboard/client`} active={pathname === `/${locale}/dashboard/client`}>
                     <Briefcase size={18} />
                     <span>{t('overview')}</span>
                  </NavLink>
                  <NavLink href={`/${locale}/accounts`} active={pathname?.includes('/accounts')}>
                     <PieChart size={18} />
                     <span>{t('accounts')}</span>
                  </NavLink>
                  <NavLink href={`/${locale}/portfolio`} active={pathname?.includes('/portfolio')}>
                     <PieChart size={18} />
                     <span>{t('portfolio')}</span>
                  </NavLink>
                  <NavLink href={`/${locale}/messages`} active={pathname?.includes('/messages')}>
                     <MessageSquare size={18} />
                     <span>{t('messages')}</span>
                  </NavLink>
                  <NavLink href={`/${locale}/feed`} active={pathname?.includes('/feed')}>
                     <Newspaper size={18} />
                     <span>{t('feed')}</span>
                  </NavLink>
                </>
              )}

              {user?.role === 'ADVISOR' && (
                <NavLink href={`/${locale}/dashboard/advisor`} active={pathname === `/${locale}/dashboard/advisor`}>
                   <Briefcase size={18} />
                   <span>{t('advisorSpace')}</span>
                </NavLink>
              )}

              {user?.role === 'DIRECTOR' && (
                <NavLink href={`/${locale}/dashboard/director`} active={pathname === `/${locale}/dashboard/director`}>
                   <Building2 size={18} />
                   <span>{t('directorSpace')}</span>
                </NavLink>
              )}

              <NavLink href={`/${locale}/profile`} active={pathname?.includes('/profile')}>
                 <Settings size={18} />
                 <span>{t('profile')}</span>
              </NavLink>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 py-8">
        <div className="container-bank mx-auto px-4">
           {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
         <div className="container-bank mx-auto px-4 text-center text-sm text-gray-500">
            <p>&copy; 2026 Banque AVENIR. Tous droits réservés. Sécurité garantie.</p>
         </div>
      </footer>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap
        ${active 
          ? 'border-primary-600 text-primary-800 bg-primary-50/50' 
          : 'border-transparent text-gray-600 hover:text-primary-600 hover:bg-gray-50'}
      `}
    >
      {children}
    </Link>
  );
}
