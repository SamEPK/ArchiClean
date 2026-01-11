'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center px-4">
        <div className="mb-8 animate-pulse flex justify-center">
          <AlertTriangle size={80} className="text-red-500" />
        </div>
        <h1 className="text-6xl font-display font-bold text-gray-900 mb-4">
          500
        </h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">
          Erreur serveur
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Une erreur inattendue s'est produite. Nos équipes ont été notifiées et travaillent à résoudre le problème.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="primary" onClick={reset}>
            Réessayer
          </Button>
          <Link href="/">
            <Button size="lg" variant="outline">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
        
        {error.digest && (
          <p className="mt-8 text-sm text-gray-500">
            Code d'erreur: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
