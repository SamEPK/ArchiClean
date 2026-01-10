import { BankAccount } from '@domain/entities/BankAccount';
import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { IClientRepository } from '@domain/repositories/IClientRepository';

/**
 * Use Case: Création d'un compte bancaire
 * 
 * Responsabilités:
 * - Vérifier l'existence du client
 * - Vérifier la confirmation d'email du client
 * - Valider les paramètres du compte
 * - Générer un IBAN unique
 * - Créer et sauvegarder le compte bancaire
 * 
 * @application Use Case - Couche Application
 */
export class CreateBankAccountUseCase {
  /**
   * Constructeur avec injection de dépendances
   * @param bankAccountRepository - Repository pour la persistance des comptes
   * @param clientRepository - Repository pour vérifier l'existence du client
   */
  constructor(
    private bankAccountRepository: IBankAccountRepository,
    private clientRepository: IClientRepository
  ) {}

  /**
   * Exécute la création d'un compte bancaire
   * 
   * @param clientId - Identifiant du client propriétaire
   * @param accountName - Nom personnalisé du compte
   * @param initialBalance - Solde initial (par défaut: 0)
   * @param currency - Devise du compte (par défaut: EUR)
   * @returns Le compte bancaire créé
   * @throws {Error} Si le client n'existe pas
   * @throws {Error} Si l'email du client n'est pas confirmé
   * @throws {Error} Si le nom du compte est vide
   * @throws {Error} Si le solde initial est négatif
   * @throws {Error} Si l'IBAN généré existe déjà (collision)
   */
  async execute(clientId: string, accountName: string, initialBalance: number = 0, currency: string = 'EUR'): Promise<BankAccount> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    if (!client.isEmailConfirmed) {
      throw new Error('Client email must be confirmed before creating a bank account');
    }

    if (!accountName || accountName.trim().length === 0) {
      throw new Error('Account name is required');
    }

    if (initialBalance < 0) {
      throw new Error('Initial balance cannot be negative');
    }

    const iban = BankAccount.generateIBAN('FR');

    const existingAccount = await this.bankAccountRepository.findByIban(iban);
    if (existingAccount) {
      throw new Error('IBAN already exists, please retry');
    }

    const bankAccount = new BankAccount({
      id: this.generateId(),
      clientId,
      iban,
      accountName: accountName.trim(),
      balance: initialBalance,
      currency,
      isActive: true,
      createdAt: new Date(),
    });

    await this.bankAccountRepository.create(bankAccount);

    return bankAccount;
  }

  /**
   * Génère un identifiant unique pour le compte
   * Format: account_[timestamp]_[random]
   * @returns Identifiant unique
   * @private
   */
  private generateId(): string {
    return `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
