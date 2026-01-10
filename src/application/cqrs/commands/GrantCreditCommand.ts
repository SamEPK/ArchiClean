export class GrantCreditCommand {
  constructor(
    public readonly clientId: string,
    public readonly amount: number,
    public readonly annualRate: number,
    public readonly insuranceRate: number,
    public readonly durationMonths: number,
  ) {}
}
