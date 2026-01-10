import Link from 'next/link';
import { Button } from '@/components/atoms/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center px-4">
        <div className="mb-8 animate-bounce">
          <span className="text-9xl">🔍</span>
        </div>
        <h1 className="text-6xl font-display font-bold text-gray-900 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">
          Page non trouvée
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" variant="primary">
              Retour à l'accueil
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Mon tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
