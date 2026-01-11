import Link from 'next/link';
import { RegisterForm } from '@/components/organisms/RegisterForm';
import { CheckCircle2, ArrowLeft, Building2 } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function RegisterPage() {
  const locale = useLocale();

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Bar matching home */}
      <div className="bg-primary-800 text-white py-4 shadow-sm flex-shrink-0">
         <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href={`/${locale}`} className="font-display font-bold text-xl flex items-center gap-2">
              <Building2 size={24} /> Banque AVENIR
            </Link>
            <Link href={`/${locale}`} className="text-sm hover:text-primary-200 flex items-center gap-1">
               <ArrowLeft size={14} /> Retour au site
            </Link>
         </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden relative">
        
        {/* Left Side: Visual - Fixed Width */}
        <div className="hidden md:flex w-[500px] flex-shrink-0 bg-primary-900 relative overflow-hidden items-end p-12">
           <div className="absolute inset-0">
             <img 
              src="https://loremflickr.com/800/1200/happy,family,home?random=10" 
              className="w-full h-full object-cover opacity-60"
              alt="Famille heureuse"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/40 to-transparent"></div>
           </div>
           
           <div className="relative z-10 text-white">
               <h2 className="text-4xl font-display font-bold mb-6 leading-tight">
                  Construisons<br/>votre avenir<br/>ensemble.
               </h2>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <CheckCircle2 size={16} />
                     </div>
                     <span className="font-medium text-primary-100">Ouverture 100% en ligne</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <CheckCircle2 size={16} />
                     </div>
                     <span className="font-medium text-primary-100">Carte Gold offerte</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <CheckCircle2 size={16} />
                     </div>
                     <span className="font-medium text-primary-100">Expertise reconnue</span>
                  </div>
               </div>
           </div>
        </div>

        {/* Right Side: Form - Centered */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center overflow-y-auto">
          <div className="w-full max-w-xl mx-auto p-8 sm:p-12 my-auto">
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Ouvrir un compte</h1>
             <p className="text-gray-600 mb-8">Rejoignez les 2 millions de clients qui nous font confiance.</p>
          
            <RegisterForm />

             <div className="mt-8 text-center text-sm text-gray-600">
                Vous avez déjà un compte ? <Link href={`/${locale}/login`} className="text-primary-700 font-bold hover:underline">Connectez-vous</Link>
             </div>
          </div>
          
           <div className="text-center py-4 text-gray-400 text-xs flex-shrink-0">
            &copy; 2026 Banque AVENIR - Mentions Légales
          </div>
        </div>
      </div>
    </div>
  );
}
