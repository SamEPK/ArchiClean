export interface CreditProps {
  id: string;
  userId: string;
  amount: number;
  annualRate: number; // as percent, e.g., 3.5
  insuranceRate: number; // as percent
  monthlyPayment?: number;
  remainingBalance?: number;
  createdAt?: Date;
}

export class Credit {
  id: string;
  userId: string;
  amount: number;
  annualRate: number;
  insuranceRate: number;
  monthlyPayment: number;
  remainingBalance: number;
  createdAt: Date;

  constructor(props: CreditProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.amount = props.amount;
    this.annualRate = props.annualRate;
    this.insuranceRate = props.insuranceRate;
    this.remainingBalance = props.remainingBalance ?? props.amount;
    this.monthlyPayment = props.monthlyPayment ?? 0;
    this.createdAt = props.createdAt ?? new Date();
  }
}
