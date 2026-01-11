'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from 'next-intl';
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
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const locale = useLocale();

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
          <Link href={`/${locale}/dashboard/client`} className="flex items-center gap-2 group">
             <div className="bg-white/10 p-2 rounded group-hover:bg-white/20 transition-colors">
                <Building2 size={24} className="text-white" />
             </div>
             <span className="font-display font-bold text-xl tracking-wide">
                Banque AVENIR
             </span>
          </Link>

          {/* User Menu & Actions */}
          <div className="flex items-center gap-6">
            <Link 
              href={`/${locale}/feed`}
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors group"
              title="Actualités & Notifications"
            >
               <Bell size={20} className="text-primary-100 group-hover:text-white" />
               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary-500 rounded-full border-2 border-primary-900"></span>
            </Link>
            
            <div className="hidden md:flex items-center gap-3 pl-6 border-l border-primary-800">
               <div className="flex flex-col items-end">
                  <span className="font-bold text-sm leading-none">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-primary-200 uppercase tracking-wider">{user?.role}</span>
               </div>
               <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center border border-primary-600">
                  <User size={20} />
               </div>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-primary-200 hover:text-white transition-colors ml-4"
            >
               <LogOut size={18} />
               <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation (Tabs) */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container-bank mx-auto px-4">
           <div className="flex gap-1 overflow-x-auto">
              <NavLink href={`/${locale}/dashboard/client`} active={pathname === `/${locale}/dashboard/client`}>
                 <Briefcase size={18} />
                 <span>Ma Synthèse</span>
              </NavLink>
              <NavLink href={`/${locale}/accounts`} active={pathname?.includes('/accounts')}>
                 <PieChart size={18} />
                 <span>Mes Comptes</span>
              </NavLink>
              <NavLink href={`/${locale}/portfolio`} active={pathname?.includes('/portfolio')}>
                 <PieChart size={18} />
                 <span>Portfolio</span>
              </NavLink>
              <NavLink href={`/${locale}/messages`} active={pathname?.includes('/messages')}>
                 <MessageSquare size={18} />
                 <span>Messages</span>
              </NavLink>
              <NavLink href={`/${locale}/feed`} active={pathname?.includes('/feed')}>
                 <Newspaper size={18} />
                 <span>Actualités</span>
              </NavLink>
              <NavLink href={`/${locale}/profile`} active={pathname?.includes('/profile')}>
                 <Settings size={18} />
                 <span>Mon Profil</span>
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
