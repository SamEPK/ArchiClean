'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-9xl font-bold text-primary-600 mb-4">
                500
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Erreur serveur
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Une erreur inattendue s'est produite. Nos équipes ont été notifiées et travaillent sur le problème.
              </p>
              {error.digest && (
                <p className="text-sm text-gray-500 mb-8">
                  Code d'erreur: {error.digest}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Button
                onClick={reset}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Réessayer
              </Button>
              
              <Link href="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
              </Link>
            </div>

            <div className="mt-12 text-sm text-gray-500">
              <p>Besoin d'aide?</p>
              <p className="mt-2">
                Contactez notre support au{' '}
                <a href="tel:+33123456789" className="text-primary-600 hover:underline">
                  01 23 45 67 89
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
