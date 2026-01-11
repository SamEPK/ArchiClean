'use client';

import { DirectorDashboard } from '@/components/organisms/DirectorDashboard';

export default function DirectorDashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Espace Directeur</h1>
        <p className="text-gray-600">Vue d'ensemble et administration de l'agence.</p>
      </div>
      
      <DirectorDashboard />
    </div>
  );
}
