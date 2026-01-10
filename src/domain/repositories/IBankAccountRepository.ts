import { BankAccount } from '../entities/BankAccount';

/**
 * Interface IBankAccountRepository - Contrat pour la persistance des comptes bancaires
 * 
 * Définit les opérations CRUD pour l'entité BankAccount.
 * Permet la gestion de la persistance des comptes bancaires
 * indépendamment de l'implémentation technique (MongoDB, PostgreSQL, etc.)
 * 
 * @domain Repository Interface - Couche Domain
 */
export interface IBankAccountRepository {
  /**
   * Crée un nouveau compte bancaire
   * @param account - L'entité compte bancaire à créer
   */
  create(account: BankAccount): Promise<void>;

  /**
   * Trouve un compte bancaire par son identifiant unique
   * @param id - Identifiant du compte
   * @returns Le compte trouvé ou null si inexistant
   */
  findById(id: string): Promise<BankAccount | null>;

  /**
   * Trouve un compte bancaire par son numéro IBAN
   * @param iban - Numéro IBAN du compte
   * @returns Le compte trouvé ou null si inexistant
   */
  findByIban(iban: string): Promise<BankAccount | null>;

  /**
   * Trouve tous les comptes bancaires d'un client
   * @param clientId - Identifiant du client
   * @returns Liste des comptes du client
   */
  findByClientId(clientId: string): Promise<BankAccount[]>;

  /**
   * Met à jour les informations d'un compte bancaire
   * @param account - L'entité compte avec les nouvelles données
   */
  update(account: BankAccount): Promise<void>;

  /**
   * Supprime un compte bancaire
   * @param id - Identifiant du compte à supprimer
   */
  delete(id: string): Promise<void>;

  /**
   * Récupère tous les comptes bancaires du système
   * @returns Liste de tous les comptes
   */
  findAll(): Promise<BankAccount[]>;
}
