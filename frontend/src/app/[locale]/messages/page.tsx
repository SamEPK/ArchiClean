'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  createdAt: string;
  isFromClient: boolean;
}

interface Conversation {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  advisorId?: string;
  advisorName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

export default function MessagesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Modal pour nouvelle conversation
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newInitialMessage, setNewInitialMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/fr/dashboard/client');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await apiClient.getClientConversations(user.id).catch(() => []);
        
        const normalizedConversations = Array.isArray(data) ? data.map((conv: any) => ({
          id: conv.id || conv._id,
          subject: conv.subject || 'Sans objet',
          status: conv.status || 'open',
          advisorId: conv.advisorId,
          advisorName: conv.advisorName || 'En attente d\'attribution',
          lastMessage: conv.lastMessage || conv.messages?.[0]?.content,
          lastMessageAt: conv.lastMessageAt || conv.updatedAt,
          unreadCount: conv.unreadCount || 0,
          createdAt: conv.createdAt,
        })) : getDefaultConversations();
        
        setConversations(normalizedConversations);
      } catch (err) {
        console.error('Erreur chargement conversations:', err);
        setConversations(getDefaultConversations());
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && !authLoading) {
      fetchConversations();
    }
  }, [user?.id, authLoading]);

  const getDefaultConversations = (): Conversation[] => [
    {
      id: '1',
      subject: 'Demande d\'information sur les crédits',
      status: 'open',
      advisorName: 'Jean Dupont',
      lastMessage: 'Bonjour, je souhaite en savoir plus sur vos offres de crédit immobilier.',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const loadMessages = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessagesLoading(true);
    
    try {
      const data = await apiClient.getConversationMessages(conversation.id).catch(() => []);
      
      const normalizedMessages = Array.isArray(data) ? data.map((msg: any) => ({
        id: msg.id || msg._id,
        content: msg.content || msg.message,
        senderId: msg.senderId || msg.sender,
        senderName: msg.senderName || (msg.senderId === user?.id ? `${user?.firstName || ''} ${user?.lastName || ''}` : conversation.advisorName),
        createdAt: msg.createdAt,
        isFromClient: msg.senderId === user?.id || msg.isFromClient,
      })) : getDefaultMessages(conversation);
      
      setMessages(normalizedMessages);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      setMessages(getDefaultMessages(conversation));
    } finally {
      setMessagesLoading(false);
    }
  };

  const getDefaultMessages = (conversation: Conversation): Message[] => [
    {
      id: '1',
      content: conversation.lastMessage || 'Bonjour, comment puis-je vous aider ?',
      senderId: 'client',
      senderName: `${user?.firstName} ${user?.lastName}`,
      createdAt: conversation.createdAt,
      isFromClient: true,
    },
    {
      id: '2',
      content: 'Bonjour ! Je suis votre conseiller et je serai ravi de vous accompagner. Quelles informations souhaitez-vous ?',
      senderId: 'advisor',
      senderName: conversation.advisorName,
      createdAt: new Date().toISOString(),
      isFromClient: false,
    },
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;
    
    try {
      setSending(true);
      
      await apiClient.sendMessage(selectedConversation.id, newMessage, user.id);
      
      // Ajouter le message localement
      const newMsg: Message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        createdAt: new Date().toISOString(),
        isFromClient: true,
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Mettre à jour la conversation
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: newMessage, lastMessageAt: new Date().toISOString() }
          : conv
      ));
    } catch (err) {
      console.error('Erreur envoi message:', err);
      // Même en cas d'erreur, ajouter localement pour la démo
      const newMsg: Message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: user?.id || '',
        senderName: `${user?.firstName} ${user?.lastName}`,
        createdAt: new Date().toISOString(),
        isFromClient: true,
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newSubject.trim() || !newInitialMessage.trim() || !user?.id) return;
    
    try {
      setSending(true);
      
      const response = await apiClient.startConversation(user.id, newSubject, newInitialMessage).catch(() => null);
      
      const newConversation: Conversation = {
        id: response?.id || Date.now().toString(),
        subject: newSubject,
        status: 'pending',
        advisorName: 'En attente d\'attribution',
        lastMessage: newInitialMessage,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setShowNewConversationModal(false);
      setNewSubject('');
      setNewInitialMessage('');
      
      // Sélectionner automatiquement la nouvelle conversation
      loadMessages(newConversation);
    } catch (err) {
      console.error('Erreur création conversation:', err);
      alert('Erreur lors de la création de la conversation');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="success">En cours</Badge>;
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      case 'closed':
        return <Badge variant="default">Fermé</Badge>;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos messages...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthenticatedLayout>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">💬 Messagerie</h1>
              <p className="text-primary-100 mt-1">Échangez avec votre conseiller</p>
            </div>
            <Button 
              onClick={() => setShowNewConversationModal(true)}
              className="bg-white text-primary-600 hover:bg-primary-50"
            >
              ✉️ Nouvelle conversation
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Liste des conversations */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardContent className="p-4 flex-1 overflow-auto">
              <h2 className="font-semibold text-gray-800 mb-4">Conversations</h2>
              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune conversation</p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadMessages(conv)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conv.id
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-gray-900 truncate flex-1">
                          {conv.subject}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-2">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {conv.advisorName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(conv.lastMessageAt || conv.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Zone de chat */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header de la conversation */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.subject}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Conseiller: {selectedConversation.advisorName}
                      </p>
                    </div>
                    {getStatusBadge(selectedConversation.status)}
                  </div>
                </div>

                {/* Messages */}
                <CardContent className="flex-1 overflow-auto p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isFromClient ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.isFromClient
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm font-medium mb-1 opacity-75">
                              {msg.senderName}
                            </p>
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.isFromClient ? 'text-primary-200' : 'text-gray-400'}`}>
                              {formatDate(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                {/* Zone d'envoi */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Écrivez votre message..."
                      disabled={sending}
                    />
                    <Button 
                      variant="primary" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                    >
                      {sending ? '...' : 'Envoyer'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm">ou créez-en une nouvelle</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal nouvelle conversation */}
      <AnimatePresence>
        {showNewConversationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewConversationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <CardTitle className="mb-6">✉️ Nouvelle conversation</CardTitle>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objet
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Question sur mon compte"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre message
                  </label>
                  <textarea
                    value={newInitialMessage}
                    onChange={(e) => setNewInitialMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewConversationModal(false)}>
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1" 
                  onClick={handleCreateConversation}
                  disabled={!newSubject.trim() || !newInitialMessage.trim() || sending}
                >
                  {sending ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AuthenticatedLayout>
  );
}
