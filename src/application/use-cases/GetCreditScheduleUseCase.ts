import { ICreditRepository } from '@domain/repositories/ICreditRepository';

/**
 * Interface représentant une mensualité du crédit
 */
export interface PaymentScheduleItem {
  /** Numéro de la mensualité */
  paymentNumber: number;
  /** Date de paiement */
  date: Date;
  /** Montant de la mensualité totale */
  totalPayment: number;
  /** Montant du capital remboursé */
  principalPayment: number;
  /** Montant des intérêts */
  interestPayment: number;
  /** Montant de l'assurance */
  insurancePayment: number;
  /** Capital restant dû après paiement */
  remainingBalance: number;
}

/**
 * Interface représentant l'échéancier complet
 */
export interface CreditSchedule {
  creditId: string;
  userId: string;
  amount: number;
  annualRate: number;
  insuranceRate: number;
  monthlyPayment: number;
  durationMonths: number;
  totalInterest: number;
  totalInsurance: number;
  totalCost: number;
  schedule: PaymentScheduleItem[];
}

/**
 * Use Case: Génération de l'échéancier complet d'un crédit
 * 
 * Responsabilités:
 * - Récupérer les informations du crédit
 * - Calculer l'échéancier avec amortissement
 * - Détailler chaque mensualité (capital, intérêts, assurance)
 * - Calculer le coût total du crédit
 * 
 * @application Use Case - Couche Application
 */
export class GetCreditScheduleUseCase {
  constructor(private creditRepository: ICreditRepository) {}

  /**
   * Exécute la génération de l'échéancier
   * 
   * @param creditId - Identifiant du crédit
   * @param durationMonths - Durée du crédit en mois
   * @returns L'échéancier complet avec détail de chaque mensualité
   * @throws {Error} Si le crédit n'existe pas
   */
  async execute(creditId: string, durationMonths: number): Promise<CreditSchedule> {
    const credit = await this.creditRepository.findById(creditId);
    
    if (!credit) {
      throw new Error('Credit not found');
    }

    // Calcul du taux mensuel
    const monthlyRate = credit.annualRate / 100 / 12;
    
    // Calcul de la mensualité du capital + intérêts (formule d'amortissement)
    const principalAndInterestPayment = 
      (credit.amount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / 
      (Math.pow(1 + monthlyRate, durationMonths) - 1);
    
    // Calcul de l'assurance mensuelle (appliquée sur le montant total)
    const monthlyInsurance = (credit.amount * (credit.insuranceRate / 100)) / durationMonths;
    
    // Mensualité totale = capital + intérêts + assurance
    const monthlyPayment = principalAndInterestPayment + monthlyInsurance;
    
    const schedule: PaymentScheduleItem[] = [];
    let remainingBalance = credit.amount;
    let totalInterest = 0;
    let totalInsurance = 0;
    
    const startDate = new Date();
    
    // Génération de chaque mensualité
    for (let month = 1; month <= durationMonths; month++) {
      // Calcul des intérêts sur le capital restant
      const interestPayment = remainingBalance * monthlyRate;
      
      // Capital remboursé = mensualité - intérêts - assurance
      const principalPayment = principalAndInterestPayment - interestPayment;
      
      // Mise à jour du capital restant
      remainingBalance -= principalPayment;
      
      // Si dernière mensualité, ajuster pour éviter les erreurs d'arrondi
      if (month === durationMonths) {
        remainingBalance = 0;
      }
      
      totalInterest += interestPayment;
      totalInsurance += monthlyInsurance;
      
      // Date de paiement (mois suivant à chaque fois)
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + month);
      
      schedule.push({
        paymentNumber: month,
        date: paymentDate,
        totalPayment: Math.round(monthlyPayment * 100) / 100,
        principalPayment: Math.round(principalPayment * 100) / 100,
        interestPayment: Math.round(interestPayment * 100) / 100,
        insurancePayment: Math.round(monthlyInsurance * 100) / 100,
        remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100),
      });
    }
    
    return {
      creditId: credit.id,
      userId: credit.userId,
      amount: credit.amount,
      annualRate: credit.annualRate,
      insuranceRate: credit.insuranceRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      durationMonths,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalInsurance: Math.round(totalInsurance * 100) / 100,
      totalCost: Math.round((credit.amount + totalInterest + totalInsurance) * 100) / 100,
      schedule,
    };
  }
}
