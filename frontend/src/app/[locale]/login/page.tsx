import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/organisms/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { useLocale } from 'next-intl';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre espace Banque AVENIR',
};

export default function LoginPage() {
  const locale = useLocale();
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Bar matching home */}
      <div className="bg-primary-800 text-white py-4 shadow-sm z-50 flex-shrink-0">
         <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href={`/${locale}`} className="font-display font-bold text-xl">
              Banque AVENIR
            </Link>
            <Link href={`/${locale}`} className="text-sm hover:text-primary-200">
               Retour au site
            </Link>
         </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left: Image (Hidden on mobile) - Fixed width */}
        <div className="hidden md:block w-[500px] flex-shrink-0 bg-gray-900 relative overflow-hidden">
             <img 
               src="https://loremflickr.com/800/1200/buildings,architecture?random=20" 
               className="w-full h-full object-cover opacity-50"
               alt="Siège social Banque AVENIR"
             />
             <div className="absolute bottom-20 left-12 right-12 text-white z-10">
                <h2 className="text-3xl font-bold mb-4">La sécurité de vos données est notre priorité.</h2>
                <div className="flex gap-2">
                   <div className="h-1 w-12 bg-white rounded-full"></div>
                   <div className="h-1 w-2 bg-white/30 rounded-full"></div>
                   <div className="h-1 w-2 bg-white/30 rounded-full"></div>
                </div>
             </div>
        </div>

        {/* Right: Login Form - Centered */}
        <div className="flex-1 flex items-center justify-center p-4 bg-white overflow-y-auto">
          <div className="w-full max-w-md space-y-8 my-auto">
            <div className="text-center">
               <h1 className="text-3xl font-bold text-gray-900">Accès Client</h1>
               <p className="text-sm text-gray-600 mt-2">Identifiez-vous pour accéder à vos comptes</p>
            </div>
            
            <div className="bg-white p-0">
               <LoginForm />
            </div>

             <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-4">
                <div>
                   <Link href={`/${locale}/forgot-password`} className="text-primary-700 hover:underline text-sm font-medium">
                      Mot de passe oublié ?
                   </Link>
                </div>
                <div>
                   <span className="text-gray-500 text-sm">Pas encore client ? </span>
                   <Link href={`/${locale}/register`} className="text-primary-700 hover:underline text-sm font-medium">
                      Ouvrir un compte
                   </Link>
                </div>
             </div>

            <div className="bg-primary-50 p-4 rounded text-center text-xs text-primary-800 border border-primary-100 flex gap-2 justify-center items-center mt-8">
               <span>🔒</span> Connexion sécurisée banque à distance
            </div>
             <div className="text-center text-gray-400 text-xs mt-8">
              &copy; 2026 Banque AVENIR - Sécurité et Confidentialité
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
