'use client';

import { ClientDashboard } from '@/components/organisms/ClientDashboard';

export default function ClientDashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur votre espace personnel.</h1>
        <p className="text-gray-600">Consultez vos comptes et gérez vos opérations en toute sécurité.</p>
      </div>
      
      <ClientDashboard />
    </div>
  );
}
