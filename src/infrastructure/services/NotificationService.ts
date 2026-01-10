/**
 * Service de notification pour les événements système
 * 
 * Responsabilités:
 * - Envoyer des notifications aux utilisateurs
 * - Gérer les notifications par WebSocket
 * - Gérer les notifications par email (optionnel)
 * 
 * @infrastructure Service - Couche Infrastructure
 */
export class NotificationService {
  private wsConnections: Map<string, any> = new Map();

  /**
   * Enregistre une connexion WebSocket pour un utilisateur
   * @param userId - Identifiant de l'utilisateur
   * @param connection - Connexion WebSocket
   */
  registerConnection(userId: string, connection: any): void {
    this.wsConnections.set(userId, connection);
  }

  /**
   * Supprime une connexion WebSocket
   * @param userId - Identifiant de l'utilisateur
   */
  unregisterConnection(userId: string): void {
    this.wsConnections.delete(userId);
  }

  /**
   * Envoie une notification à un utilisateur spécifique
   * @param userId - Identifiant de l'utilisateur
   * @param notification - Contenu de la notification
   */
  async notifyUser(userId: string, notification: any): Promise<void> {
    const connection = this.wsConnections.get(userId);
    if (connection && connection.readyState === 1) {
      connection.send(JSON.stringify(notification));
    }
  }

  /**
   * Envoie une notification à tous les utilisateurs connectés
   * @param notification - Contenu de la notification
   */
  async notifyAll(notification: any): Promise<void> {
    const message = JSON.stringify(notification);
    this.wsConnections.forEach((connection) => {
      if (connection.readyState === 1) {
        connection.send(message);
      }
    });
  }

  /**
   * Notifie tous les clients du changement de taux d'épargne
   * @param newRate - Nouveau taux d'intérêt
   * @param updatedCount - Nombre de comptes mis à jour
   */
  async notifySavingsRateChange(newRate: number, updatedCount: number): Promise<void> {
    const notification = {
      type: 'SAVINGS_RATE_CHANGE',
      title: 'Changement de taux d\'épargne',
      message: `Le taux d'épargne a été modifié à ${newRate}%. Cette modification s'applique à ${updatedCount} comptes d'épargne.`,
      data: {
        newRate,
        updatedCount,
        timestamp: new Date().toISOString(),
      },
      priority: 'high',
    };

    await this.notifyAll(notification);
    console.log(`📢 Notification envoyée: Changement de taux d'épargne à ${newRate}% (${updatedCount} comptes affectés)`);
  }

  /**
   * Notifie un client d'un événement spécifique
   * @param clientId - Identifiant du client
   * @param type - Type de notification
   * @param message - Message de la notification
   * @param data - Données supplémentaires
   */
  async notifyClient(
    clientId: string,
    type: string,
    message: string,
    data?: any
  ): Promise<void> {
    const notification = {
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    await this.notifyUser(clientId, notification);
  }
}

// Singleton instance
let notificationServiceInstance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
}
