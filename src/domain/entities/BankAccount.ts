/**
 * Interface définissant les propriétés d'un compte bancaire
 */
export interface BankAccountProps {
  /** Identifiant unique du compte */
  id: string;
  /** Identifiant du client propriétaire */
  clientId: string;
  /** Numéro IBAN (International Bank Account Number) */
  iban: string;
  /** Nom du compte (personnalisé par l'utilisateur) */
  accountName: string;
  /** Solde actuel du compte */
  balance: number;
  /** Devise du compte (EUR, USD, etc.) */
  currency: string;
  /** Compte actif ou désactivé */
  isActive: boolean;
  /** Date de création du compte */
  createdAt: Date;
  /** Date de dernière modification */
  updatedAt?: Date;
}

/**
 * Entité BankAccount - Représente un compte bancaire
 * 
 * Cette entité gère les opérations bancaires de base (dépôts, retraits)
 * et la validation de l'IBAN selon la norme ISO 13616.
 * 
 * @domain Entity - Couche Domain
 */
export class BankAccount {
  public readonly id: string;
  public readonly clientId: string;
  public readonly iban: string;
  public accountName: string;
  public balance: number;
  public readonly currency: string;
  public isActive: boolean;
  public readonly createdAt: Date;
  public updatedAt?: Date;

  /**
   * Constructeur de l'entité BankAccount
   * @param props - Propriétés initiales du compte bancaire
   */
  constructor(props: BankAccountProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.iban = props.iban;
    this.accountName = props.accountName;
    this.balance = props.balance;
    this.currency = props.currency;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Met à jour le nom personnalisé du compte
   * 
   * @param newName - Nouveau nom du compte
   * @throws {Error} Si le nom est vide
   */
  public updateAccountName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Account name cannot be empty');
    }
    this.accountName = newName.trim();
    this.updatedAt = new Date();
  }

  /**
   * Désactive le compte bancaire
   * Un compte désactivé ne peut plus effectuer de transactions
   */
  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Effectue un dépôt sur le compte
   * 
   * @param amount - Montant à déposer (doit être positif)
   * @throws {Error} Si le montant est négatif ou nul
   * @throws {Error} Si le compte est inactif
   * 
   * Règle métier: Seuls les comptes actifs peuvent recevoir des dépôts
   */
  public deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    if (!this.isActive) {
      throw new Error('Cannot deposit to inactive account');
    }
    this.balance += amount;
    this.updatedAt = new Date();
  }

  /**
   * Effectue un retrait du compte
   * 
   * @param amount - Montant à retirer (doit être positif)
   * @throws {Error} Si le montant est négatif ou nul
   * @throws {Error} Si le compte est inactif
   * @throws {Error} Si le solde est insuffisant
   * 
   * Règle métier: Pas de découvert autorisé (balance >= amount)
   */
  public withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (!this.isActive) {
      throw new Error('Cannot withdraw from inactive account');
    }
    if (amount > this.balance) {
      throw new Error('Insufficient balance');
    }
    this.balance -= amount;
    this.updatedAt = new Date();
  }

  /**
   * Génère un IBAN valide selon la norme ISO 13616
   * 
   * @param countryCode - Code pays à 2 lettres (par défaut: 'FR')
   * @returns IBAN complet formaté (ex: FR7630003036200000123456789)
   * 
   * Format: Code pays (2) + Clé de contrôle (2) + Code banque (5) + Code guichet (5) + Numéro de compte (11)
   */
  public static generateIBAN(countryCode: string = 'FR'): string {
    const bankCode = '30003';     // Code banque (Banque AVENIR)
    const branchCode = '03620';   // Code guichet
    const accountNumber = BankAccount.generateRandomDigits(11);
    const checkDigits = BankAccount.calculateIBANCheckDigits(countryCode, bankCode, branchCode, accountNumber);

    return `${countryCode}${checkDigits}${bankCode}${branchCode}${accountNumber}`;
  }

  /**
   * Génère une chaîne de chiffres aléatoires
   * 
   * @param length - Nombre de chiffres à générer
   * @returns Chaîne de chiffres aléatoires
   * @private
   */
  private static generateRandomDigits(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  /**
   * Calcule les 2 chiffres de contrôle de l'IBAN selon l'algorithme modulo 97
   * 
   * @param countryCode - Code pays (2 lettres)
   * @param bankCode - Code banque (5 chiffres)
   * @param branchCode - Code guichet (5 chiffres)
   * @param accountNumber - Numéro de compte (11 chiffres)
   * @returns Les 2 chiffres de contrôle (00-96)
   * @private
   */
  private static calculateIBANCheckDigits(countryCode: string, bankCode: string, branchCode: string, accountNumber: string): string {
    const bban = bankCode + branchCode + accountNumber;
    const countryCodeNumeric = countryCode.charCodeAt(0) - 55 + '' + (countryCode.charCodeAt(1) - 55);
    const numericIBAN = bban + countryCodeNumeric + '00';

    const mod97 = BankAccount.mod97(numericIBAN);
    const checkDigits = 98 - mod97;

    return checkDigits.toString().padStart(2, '0');
  }

  /**
   * Calcule le modulo 97 d'un grand nombre représenté en chaîne
   * Utilisé pour la validation IBAN selon la norme ISO 13616
   * 
   * @param numericString - Nombre sous forme de chaîne
   * @returns Reste de la division par 97
   * @private
   */
  private static mod97(numericString: string): number {
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }
    return remainder;
  }

  /**
   * Valide un IBAN selon la norme ISO 13616
   * 
   * @param iban - IBAN à valider (peut contenir des espaces)
   * @returns true si l'IBAN est valide, false sinon
   * 
   * Vérifications effectuées:
   * - Longueur (15-34 caractères)
   * - Format (lettres et chiffres uniquement)
   * - Clé de contrôle (modulo 97 = 1)
   */
  public static validateIBAN(iban: string): boolean {
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();

    if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
      return false;
    }

    const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);

    let numericString = '';
    for (const char of rearranged) {
      if (char >= '0' && char <= '9') {
        numericString += char;
      } else if (char >= 'A' && char <= 'Z') {
        numericString += (char.charCodeAt(0) - 55).toString();
      } else {
        return false;
      }
    }

    return BankAccount.mod97(numericString) === 1;
  }
}
