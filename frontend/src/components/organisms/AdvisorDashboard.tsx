'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { FormField } from '@/components/molecules/FormField';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MessageSquare, CreditCard, Users, Send, Clock, CheckCircle } from 'lucide-react';

type Tab = 'conversations' | 'credits' | 'clients';

export function AdvisorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('conversations');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  
  // Credits form
  const { register: registerCredit, handleSubmit: handleCreditSubmit, reset: resetCredit } = useForm();
  
  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadData = async () => {
    try {
      if (activeTab === 'conversations') {
        // Use the endpoint we added to api-client.ts
         const data = await apiClient.getAdvisorOpenConversations();
         if (data?.conversations) setConversations(data.conversations);
      } else if (activeTab === 'clients') {
        // Load assigned clients if endpoint exists
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const data = await apiClient.getConversationMessages(convId);
      if (data?.messages) setMessages(data.messages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyContent.trim()) return;
    try {
      await apiClient.replyToConversation(selectedConversation, replyContent);
      setReplyContent('');
      loadMessages(selectedConversation); // Refresh
      toast.success('Réponse envoyée');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  const onGrantCredit = async (data: any) => {
    try {
      await apiClient.grantCredit({
        ...data,
        amount: parseFloat(data.amount),
        annualRate: parseFloat(data.annualRate),
        insuranceRate: parseFloat(data.insuranceRate),
        durationMonths: parseInt(data.durationMonths)
      });
      toast.success('Crédit accordé avec succès');
      resetCredit();
    } catch (error) {
       toast.error('Erreur lors de l\'octroi du crédit');
    }
  };

  return (
    <div className="space-y-6">
       {/* Tabs */}
       <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton id="conversations" label="Conversations" icon={<MessageSquare size={16}/>} active={activeTab} onClick={setActiveTab} />
        <TabButton id="credits" label="Octroyer Crédit" icon={<CreditCard size={16}/>} active={activeTab} onClick={setActiveTab} />
        <TabButton id="clients" label="Mes Clients" icon={<Users size={16}/>} active={activeTab} onClick={setActiveTab} />
      </div>

      {/* CONVERSATIONS TAB */}
      {activeTab === 'conversations' && (
        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
          {/* List */}
          <Card className="md:col-span-1 flex flex-col h-full">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-sm">Discussions en cours</CardTitle></CardHeader>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
               {conversations.length === 0 ? (
                 <div className="text-center text-gray-400 text-sm py-8">Aucune conversation</div>
               ) : (
                 conversations.map(conv => (
                   <button 
                     key={conv.id}
                     onClick={() => setSelectedConversation(conv.id)}
                     className={`w-full text-left p-3 rounded-lg text-sm transition-colors border
                       ${selectedConversation === conv.id 
                         ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-300' 
                         : 'bg-white hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
                   >
                     <div className="font-semibold text-gray-800">{conv.clientId}</div> 
                     {/* Note: clientId is displayed because we might not have client name populated in this simplistic view. Real app would lookup name */}
                     <div className="text-xs text-gray-500 mt-1 truncate">{conv.subject || 'Pas de sujet'}</div>
                   </button>
                 ))
               )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col h-full">
            {selectedConversation ? (
              <>
                 <CardHeader className="py-3 border-b bg-gray-50/50">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Conversation active</span>
                        <span className="text-xs text-green-600 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> En ligne</span>
                    </div>
                 </CardHeader>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                     {messages.map((msg, idx) => (
                         <div key={idx} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm
                                 ${msg.senderId === user?.id 
                                     ? 'bg-primary-600 text-white rounded-tr-none' 
                                     : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                                 <p>{msg.content}</p>
                                 <div className={`text-[10px] mt-1 ${msg.senderId === user?.id ? 'text-primary-100' : 'text-gray-400'}`}>
                                     {new Date(msg.timestamp).toLocaleTimeString()}
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>

                 <div className="p-3 border-t bg-white">
                     <div className="flex gap-2">
                         <input 
                           type="text" 
                           className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                           placeholder="Écrivez votre réponse..."
                           value={replyContent}
                           onChange={e => setReplyContent(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                         />
                         <Button onClick={handleSendReply} size="sm" className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                             <Send size={18} />
                         </Button>
                     </div>
                 </div>
              </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>Sélectionnez une conversation pour afficher les messages</p>
                </div>
            )}
          </Card>
        </div>
      )}

      {/* CREDITS TAB */}
      {activeTab === 'credits' && (
          <div className="grid md:grid-cols-2 gap-8">
              <Card>
                  <CardHeader><CardTitle>Simulateur & Octroi</CardTitle></CardHeader>
                  <CardContent>
                      <form onSubmit={handleCreditSubmit(onGrantCredit)} className="space-y-4">
                          <FormField label="ID Client" name="clientId" register={registerCredit} required placeholder="UUID du client" />
                          <div className="grid grid-cols-2 gap-4">
                              <FormField label="Montant (€)" name="amount" type="number" register={registerCredit} required placeholder="25000" />
                              <FormField label="Durée (Mois)" name="durationMonths" type="number" register={registerCredit} required placeholder="60" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <FormField label="Taux Annuel (%)" name="annualRate" type="number" step="0.01" register={registerCredit} required placeholder="3.5" />
                              <FormField label="Taux Assurance (%)" name="insuranceRate" type="number" step="0.01" register={registerCredit} required placeholder="0.35" />
                          </div>
                          <Button type="submit" fullWidth>Valider le crédit</Button>
                      </form>
                  </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary-900 to-primary-800 text-white border-none">
                  <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                      <Clock size={48} className="mb-4 text-primary-200" />
                      <h3 className="text-xl font-bold mb-2">Processus Rapide</h3>
                      <p className="text-primary-100 text-sm">
                          L'octroi de crédit via cette interface génère automatiquement le plan de remboursement et notifie le client.
                      </p>
                  </CardContent>
              </Card>
          </div>
      )}

      {/* CLIENTS TAB */}
      {activeTab === 'clients' && (
          <Card>
              <CardHeader><CardTitle>Mon Portefeuille Clients</CardTitle></CardHeader>
              <CardContent>
                  <div className="text-center py-12 text-gray-500">
                      <Users size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Visualisation du portefeuille client en cours de développement.</p>
                  </div>
              </CardContent>
          </Card>
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
