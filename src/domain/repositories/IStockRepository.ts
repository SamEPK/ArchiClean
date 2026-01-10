import { Stock } from '../entities/Stock';

/**
 * Interface IStockRepository - Contrat pour la persistance des actions boursières
 * 
 * Gère la persistance des actions disponibles à la transaction.
 * Permet la gestion du catalogue d'actions indépendamment de la base de données.
 * 
 * @domain Repository Interface - Couche Domain
 */
export interface IStockRepository {
  /**
   * Sauvegarde une nouvelle action dans le catalogue
   * @param stock - L'entité action à sauvegarder
   * @returns L'action sauvegardée
   */
  save(stock: Stock): Promise<Stock>;

  /**
   * Trouve une action par son identifiant unique
   * @param id - Identifiant de l'action
   * @returns L'action trouvée ou null si inexistante
   */
  findById(id: string): Promise<Stock | null>;

  /**
   * Trouve une action par son symbole boursier (ex: AAPL, GOOGL)
   * @param symbol - Symbole boursier de l'action
   * @returns L'action trouvée ou null si inexistante
   */
  findBySymbol(symbol: string): Promise<Stock | null>;

  /**
   * Récupère toutes les actions du catalogue
   * @returns Liste de toutes les actions
   */
  findAll(): Promise<Stock[]>;

  /**
   * Récupère uniquement les actions disponibles à la transaction
   * @returns Liste des actions actives/disponibles
   */
  findAvailable(): Promise<Stock[]>;

  /**
   * Met à jour les informations d'une action existante
   * @param stock - L'entité action avec les nouvelles données
   * @returns L'action mise à jour
   */
  update(stock: Stock): Promise<Stock>;

  /**
   * Supprime une action du catalogue
   * @param id - Identifiant de l'action à supprimer
   */
  delete(id: string): Promise<void>;
}
