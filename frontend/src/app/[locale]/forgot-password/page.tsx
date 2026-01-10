import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Lock, ArrowLeft, Mail } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Bar matching home */}
      <div className="bg-primary-800 text-white py-4 shadow-sm">
         <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href={`/${locale}`} className="font-display font-bold text-xl">
              Banque AVENIR
            </Link>
            <Link href={`/${locale}/login`} className="text-sm hover:text-primary-200 flex items-center gap-1">
               <ArrowLeft size={14} /> Retour à la connexion
            </Link>
         </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200 text-center">
             <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={24} />
             </div>
             <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h1>
             <p className="text-sm text-gray-600 mt-2">
                Entrez votre email pour recevoir les instructions de réinitialisation.
             </p>
          </div>
          
          <div className="p-8">
            <form className="space-y-6">
                <div>
                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                   </label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="votre@email.com" 
                        className="pl-10 w-full"
                        required
                      />
                   </div>
                </div>

                <Button className="w-full btn-bank-primary py-3">
                   Envoyer le lien
                </Button>
            </form>

             <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link href={`/${locale}/login`} className="text-primary-700 hover:underline text-sm font-medium">
                   Annuler et retourner à la connexion
                </Link>
             </div>
          </div>
        </div>
      </div>
       <div className="text-center py-6 text-gray-400 text-sm">
        &copy; 2026 Banque AVENIR - Sécurité et Confidentialité
      </div>
    </div>
  );
}
