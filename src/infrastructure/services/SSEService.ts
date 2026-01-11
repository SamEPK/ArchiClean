import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface SSEEvent {
  type: 'article' | 'notification';
  data: any;
  targetUserId?: string; // Si défini, l'event est destiné à un utilisateur spécifique
}

@Injectable()
export class SSEService {
  private readonly eventSubject = new Subject<SSEEvent>();
  
  // Émet un nouvel article (broadcast à tous les clients)
  emitArticle(article: any): void {
    console.log('[SSE] Broadcasting article:', article.title);
    this.eventSubject.next({
      type: 'article',
      data: article,
    });
  }

  // Émet une notification à un utilisateur spécifique
  emitNotification(notification: any, targetUserId: string): void {
    console.log('[SSE] Sending notification to user:', targetUserId, notification.title);
    this.eventSubject.next({
      type: 'notification',
      data: notification,
      targetUserId,
    });
  }

  // Observable pour le flux d'articles (tous les utilisateurs)
  getArticleStream(): Observable<MessageEvent> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === 'article'),
      map(event => ({
        data: JSON.stringify(event.data),
      } as MessageEvent))
    );
  }

  // Observable pour le flux de notifications d'un utilisateur spécifique
  getNotificationStream(userId: string): Observable<MessageEvent> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === 'notification' && event.targetUserId === userId),
      map(event => ({
        data: JSON.stringify(event.data),
      } as MessageEvent))
    );
  }

  // Observable combiné pour un utilisateur (articles + ses notifications)
  getUserFeedStream(userId: string): Observable<MessageEvent> {
    return this.eventSubject.asObservable().pipe(
      filter(event => 
        event.type === 'article' || 
        (event.type === 'notification' && event.targetUserId === userId)
      ),
      map(event => ({
        data: JSON.stringify({
          eventType: event.type,
          ...event.data,
        }),
      } as MessageEvent))
    );
  }
}
