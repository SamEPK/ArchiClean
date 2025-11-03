export interface BankAccountProps {
  id: string;
  clientId: string;
  iban: string;
  accountName: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

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

  public updateAccountName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Account name cannot be empty');
    }
    this.accountName = newName.trim();
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

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

  public static generateIBAN(countryCode: string = 'FR'): string {
    const bankCode = '30003';
    const branchCode = '03620';
    const accountNumber = BankAccount.generateRandomDigits(11);
    const checkDigits = BankAccount.calculateIBANCheckDigits(countryCode, bankCode, branchCode, accountNumber);

    return `${countryCode}${checkDigits}${bankCode}${branchCode}${accountNumber}`;
  }

  private static generateRandomDigits(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  private static calculateIBANCheckDigits(countryCode: string, bankCode: string, branchCode: string, accountNumber: string): string {
    const bban = bankCode + branchCode + accountNumber;
    const countryCodeNumeric = countryCode.charCodeAt(0) - 55 + '' + (countryCode.charCodeAt(1) - 55);
    const numericIBAN = bban + countryCodeNumeric + '00';

    const mod97 = BankAccount.mod97(numericIBAN);
    const checkDigits = 98 - mod97;

    return checkDigits.toString().padStart(2, '0');
  }

  private static mod97(numericString: string): number {
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }
    return remainder;
  }

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
