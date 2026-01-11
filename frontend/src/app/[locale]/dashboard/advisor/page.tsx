'use client';

import { AdvisorDashboard } from '@/components/organisms/AdvisorDashboard';

export default function AdvisorDashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Espace Conseiller</h1>
        <p className="text-gray-600">Gérez votre portefeuille de clients et vos rendez-vous.</p>
      </div>
      
      <AdvisorDashboard />
    </div>
  );
}
