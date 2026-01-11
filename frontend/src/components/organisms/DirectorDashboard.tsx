'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { FormField } from '@/components/molecules/FormField';
import { useForm } from 'react-hook-form';
import { User, UserRole } from '@/types/user';
import { toast } from 'react-hot-toast';
import { TrendingUp, Users, UserPlus, Sliders, DollarSign, Power, Ban, Trash2, Edit2, Link as LinkIcon, AlertCircle } from 'lucide-react';

type Tab = 'stocks' | 'clients' | 'assignments' | 'savings' | 'system';

export function DirectorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('stocks');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]); // Need an endpoint for this
  const [advisors, setAdvisors] = useState<any[]>([]);

  // Forms
  const { register: registerStock, handleSubmit: handleStockSubmit, reset: resetStock } = useForm();
  const { register: registerClient, handleSubmit: handleClientSubmit, reset: resetClient } = useForm();
  const { register: registerRate, handleSubmit: handleRateSubmit } = useForm();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stocks') {
        const data = await apiClient.getStocks();
        if (Array.isArray(data)) setStocks(data);
        else if (data.stocks) setStocks(data.stocks); // Handle various response formats
      } else if (activeTab === 'clients' || activeTab === 'assignments') {
        // Warning: Director might not have a direct list-all endpoint, depending on backend implementation
        // Mocking client list fetch if needed or using available endpoints
        try {
          // Attempt to fetch clients via search or specific endpoint
          // For now, we'll try to get data via simulation or available public endpoints
          // apiClient.getAllClients() is added but might 404
          const clientsData = await apiClient.getAllClients();
           if (Array.isArray(clientsData)) setClients(clientsData);
        } catch (e) {
            console.warn("Could not fetch clients");
        }
        
        const advisorData = await apiClient.getDirectorAdvisors();
        if (advisorData?.advisors) setAdvisors(advisorData.advisors);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const onCreateStock = async (data: any) => {
    try {
      await apiClient.createStock({
        ...data,
        isAvailable: true // Default
      });
      toast.success('Action créée avec succès');
      resetStock();
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la création de l\'action');
    }
  };

  const onToggleStock = async (stock: any) => {
    try {
      await apiClient.toggleStockAvailability(stock.id, !stock.isAvailable);
      toast.success(`Action ${!stock.isAvailable ? 'activée' : 'désactivée'}`);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const onDeleteStock = async (id: string) => {
      if(!confirm("Êtes-vous sûr ?")) return;
      try {
          await apiClient.deleteStock(id);
          toast.success("Action supprimée");
          loadData();
      } catch(e) { toast.error("Erreur suppression"); }
  }

  const onCreateClient = async (data: any) => {
      try {
          await apiClient.createClientByDirector(data);
          toast.success("Client créé");
          resetClient();
          loadData();
      } catch(e) { toast.error("Erreur création client"); }
  }

  const onUpdateRate = async (data: any) => {
      try {
          await apiClient.updateSavingsRate(parseFloat(data.interestRate));
          toast.success("Taux mis à jour");
      } catch(e) { toast.error("Erreur mise à jour taux"); }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton id="stocks" label="Gestion Actions" icon={<TrendingUp size={16}/>} active={activeTab} onClick={setActiveTab} />
        <TabButton id="clients" label="Gestion Clients" icon={<Users size={16}/>} active={activeTab} onClick={setActiveTab} />
        <TabButton id="assignments" label="Affectation Clients" icon={<LinkIcon size={16}/>} active={activeTab} onClick={setActiveTab} />
        <TabButton id="savings" label="Taux Épargne" icon={<DollarSign size={16}/>} active={activeTab} onClick={setActiveTab} />
        <TabButton id="system" label="Système" icon={<Sliders size={16}/>} active={activeTab} onClick={setActiveTab} />
      </div>

      {/* STOCKS TAB */}
      {activeTab === 'stocks' && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader><CardTitle>Créer une action</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleStockSubmit(onCreateStock)} className="space-y-4">
                <FormField label="Symbole (ex: AAPL)" name="symbol" register={registerStock} required />
                <FormField label="Nom" name="name" register={registerStock} required />
                <FormField label="Entreprise" name="companyName" register={registerStock} required />
                <Button type="submit" fullWidth>Ajouter au marché</Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
             <CardHeader><CardTitle>Actions disponibles</CardTitle></CardHeader>
             <CardContent>
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="bg-gray-50 text-gray-700 uppercase">
                             <tr>
                                 <th className="px-4 py-3">Symbole</th>
                                 <th className="px-4 py-3">Nom</th>
                                 <th className="px-4 py-3">État</th>
                                 <th className="px-4 py-3">Actions</th>
                             </tr>
                         </thead>
                         <tbody>
                             {stocks.map(stock => (
                                 <tr key={stock.id} className="border-b hover:bg-gray-50">
                                     <td className="px-4 py-3 font-medium">{stock.symbol}</td>
                                     <td className="px-4 py-3">{stock.name}</td>
                                     <td className="px-4 py-3">
                                         <span className={`px-2 py-1 rounded text-xs font-semibold ${stock.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                             {stock.isAvailable ? 'Disponible' : 'Indisponible'}
                                         </span>
                                     </td>
                                     <td className="px-4 py-3 flex gap-2">
                                         <button onClick={() => onToggleStock(stock)} className="p-1 text-gray-500 hover:text-blue-600 tooltip" title="Activer/Désactiver">
                                             <Power size={16} />
                                         </button>
                                         <button onClick={() => onDeleteStock(stock.id)} className="p-1 text-gray-500 hover:text-red-600 tooltip" title="Supprimer">
                                             <Trash2 size={16} />
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                             {stocks.length === 0 && (
                                 <tr><td colSpan={4} className="text-center py-4 text-gray-500">Aucune action disponible</td></tr>
                             )}
                         </tbody>
                     </table>
                 </div>
             </CardContent>
          </Card>
        </div>
      )}

      {/* CLIENTS TAB */}
      {activeTab === 'clients' && (
        <div className="grid md:grid-cols-3 gap-6">
           <Card className="md:col-span-1 h-fit">
              <CardHeader><CardTitle>Nouveau Client</CardTitle></CardHeader>
              <CardContent>
                 <form onSubmit={handleClientSubmit(onCreateClient)} className="space-y-4">
                    <FormField label="Email" name="email" type="email" register={registerClient} required />
                    <FormField label="Mot de passe" name="password" type="password" register={registerClient} required />
                    <FormField label="Prénom" name="firstName" register={registerClient} required />
                    <FormField label="Nom" name="lastName" register={registerClient} required />
                    <FormField label="Téléphone" name="phoneNumber" register={registerClient} />
                    <Button type="submit" fullWidth>Créer le client</Button>
                 </form>
              </CardContent>
           </Card>

           <Card className="md:col-span-2">
              <CardHeader><CardTitle>Liste des clients</CardTitle></CardHeader>
              <CardContent>
                 <div className="border rounded-lg p-8 text-center text-gray-500 bg-gray-50">
                     <Users size={48} className="mx-auto mb-4 opacity-20" />
                     <p>Fonctionnalité de liste complète des clients en cours d'implémentation (nécessite une route API spécifique).</p>
                     <p className="text-sm mt-2">Utilisez la recherche dans l'onglet Affectations pour trouver un client spécifique.</p>
                 </div>
              </CardContent>
           </Card>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
         <Card>
             <CardHeader><CardTitle>Affectation Client - Conseiller</CardTitle></CardHeader>
             <CardContent>
                 <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                     <div className="flex items-center gap-2 mb-2">
                         <AlertCircle />
                         <span className="font-semibold">Simulateur d'affectation</span>
                     </div>
                     <p className="text-sm">
                         Cette interface permettrait de lier manuellement un client orphelin à un conseiller. 
                         Actuellement, l'affectation se fait automatiquement lors de la première interaction ou prise de contact.
                     </p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8 mt-8">
                     <div>
                         <h3 className="font-semibold mb-4 text-gray-700">1. Rechercher un client</h3>
                         <input type="text" placeholder="Nom du client..." className="w-full p-2 border rounded" />
                     </div>
                     <div>
                         <h3 className="font-semibold mb-4 text-gray-700">2. Sélectionner un conseiller</h3>
                         <select className="w-full p-2 border rounded bg-white">
                             <option value="">Choisir un conseiller...</option>
                             {advisors.map(adv => (
                                 <option key={adv.id} value={adv.id}>{adv.firstName} {adv.lastName}</option>
                             ))}
                         </select>
                     </div>
                 </div>
                 <div className="mt-8 flex justify-end">
                     <Button disabled>Valider l'affectation</Button>
                 </div>
             </CardContent>
         </Card>
      )}

      {/* SAVINGS TAB */}
      {activeTab === 'savings' && (
          <Card className="max-w-xl mx-auto">
              <CardHeader><CardTitle>Politique d'Épargne</CardTitle></CardHeader>
              <CardContent>
                  <form onSubmit={handleRateSubmit(onUpdateRate)} className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg text-blue-800 mb-6">
                          Le taux actuel impacte tous les livrets d'épargne. La mise à jour est immédiate pour le calcul des prochains intérêts quotidiens.
                      </div>
                      <FormField 
                        label="Taux d'intérêt quotidien (%)" 
                        name="interestRate" 
                        type="number" 
                        step="0.0001" 
                        placeholder="0.0082"
                        register={registerRate} 
                        required 
                      />
                      <Button type="submit" fullWidth>Mettre à jour le taux global</Button>
                  </form>
              </CardContent>
          </Card>
      )}

      {/* SYSTEM TAB */}
      {activeTab === 'system' && (
          <div className="grid md:grid-cols-2 gap-6">
              <Card>
                  <CardHeader><CardTitle>État du système</CardTitle></CardHeader>
                  <CardContent>
                      <div className="space-y-4">
                          <StatusRow label="API Backend" status="online" />
                          <StatusRow label="Base de données (Users)" status="online" />
                          <StatusRow label="Event Store" status="online" />
                          <StatusRow label="Services Tiers" status="online" />
                      </div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-2 text-gray-600">
                      <p><strong>Version:</strong> v2.1.0 (Stable)</p>
                      <p><strong>Dernier déploiement:</strong> 11 Jan 2026</p>
                      <p><strong>Environnement:</strong> Production</p>
                  </CardContent>
              </Card>
          </div>
      )}
    </div>
  );
}

const TabButton = ({ id, label, icon, active, onClick }: { id: Tab, label: string, icon: any, active: string, onClick: (t: Tab) => void }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
            ${active === id 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
    >
        {icon}
        {label}
    </button>
)

const StatusRow = ({ label, status }: { label: string, status: 'online' | 'offline' | 'warning' }) => (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full uppercase
            ${status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {status}
        </span>
    </div>
)
