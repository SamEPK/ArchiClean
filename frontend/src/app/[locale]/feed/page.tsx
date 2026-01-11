'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

// Types
interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'advisor' | 'director';
  createdAt: string;
  category: 'news' | 'promotion' | 'alert' | 'info';
  isPublished: boolean;
}

interface Notification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'message' | 'alert' | 'info' | 'success' | 'warning';
  createdAt: string;
  isRead: boolean;
  senderId?: string;
  senderName?: string;
}

type FeedItem = 
  | { type: 'article'; data: Article }
  | { type: 'notification'; data: Notification }
  | { type: 'heartbeat'; timestamp: string };

// Hook personnalisé pour SSE
export function useSSEFeed(userId?: string) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const endpoint = userId 
      ? `${baseUrl}/feed/stream/${userId}` 
      : `${baseUrl}/feed/stream`;

    console.log('[SSE] Connecting to:', endpoint);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(endpoint);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[SSE] Connected');
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Received:', data);

        if (data.type === 'article') {
          setArticles(prev => [data, ...prev]);
        } else if (data.type === 'notification') {
          setNotifications(prev => [data, ...prev]);
        } else if (data.type === 'heartbeat') {
          console.log('[SSE] Heartbeat received');
        }
      } catch (err) {
        console.error('[SSE] Parse error:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] Error:', err);
      setIsConnected(false);
      setError('Connexion SSE perdue, reconnexion...');
      
      // Auto-reconnect après 5 secondes
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          connect();
        }
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  const markNotificationAsRead = async (notificationId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      await fetch(`${baseUrl}/notifications/${notificationId}/read`, { method: 'PUT' });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return {
    articles,
    notifications,
    isConnected,
    error,
    markNotificationAsRead,
    unreadCount: notifications.filter(n => !n.isRead).length,
  };
}

// Hook pour notifications seules
export function useSSENotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!userId) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const endpoint = `${baseUrl}/notifications/stream/${userId}`;

    console.log('[SSE Notifications] Connecting to:', endpoint);

    const eventSource = new EventSource(endpoint);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[SSE Notifications] Connected');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          setNotifications(prev => [data, ...prev]);
        }
      } catch (err) {
        console.error('[SSE Notifications] Parse error:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  return { notifications, isConnected };
}

// Composant FeedPage
export default function FeedPage() {
  const userId = typeof window !== 'undefined' 
    ? localStorage.getItem('userId') || undefined 
    : undefined;
  
  const { articles, notifications, isConnected, error, markNotificationAsRead, unreadCount } = useSSEFeed(userId);
  const [activeTab, setActiveTab] = useState<'articles' | 'notifications'>('articles');

  // Charger les articles existants au montage
  const [initialArticles, setInitialArticles] = useState<Article[]>([]);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/feed`);
        const data = await response.json();
        if (data.success) {
          setInitialArticles(data.articles);
        }
      } catch (err) {
        console.error('Failed to fetch initial articles:', err);
      }
    };
    fetchArticles();
  }, []);

  const allArticles = [...articles, ...initialArticles];

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      news: { bg: 'bg-blue-100', text: 'text-blue-800', label: '📰 Actualité' },
      promotion: { bg: 'bg-green-100', text: 'text-green-800', label: '🎉 Promotion' },
      alert: { bg: 'bg-red-100', text: 'text-red-800', label: '⚠️ Alerte' },
      info: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'ℹ️ Info' },
    };
    return badges[category] || badges.info;
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      message: '💬',
      alert: '🚨',
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
    };
    return icons[type] || 'ℹ️';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          📰 Feed & Notifications
        </h1>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? '🟢 Connecté (SSE)' : '🔴 Déconnecté'}
          </span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
              {unreadCount} non lues
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'articles'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📰 Actualités ({allArticles.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium relative ${
            activeTab === 'notifications'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔔 Notifications ({notifications.length})
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'articles' ? (
        <div className="space-y-4">
          {allArticles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-5xl mb-4">📭</p>
              <p>Aucune actualité pour le moment</p>
              <p className="text-sm">Les nouvelles actualités apparaîtront ici en temps réel</p>
            </div>
          ) : (
            allArticles.map((article) => {
              const badge = getCategoryBadge(article.category);
              return (
                <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {article.authorRole === 'director' && (
                        <span className="ml-2 inline-block px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                          👑 Directeur
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {article.content}
                  </p>
                  <p className="text-sm text-gray-500">
                    Par <span className="font-medium">{article.authorName}</span>
                  </p>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-5xl mb-4">🔕</p>
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 rounded-lg border ${
                  notif.isRead 
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200' 
                    : 'bg-blue-50 dark:bg-blue-900 border-blue-200'
                }`}
                onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {notif.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {notif.senderName && ` • De ${notif.senderName}`}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
