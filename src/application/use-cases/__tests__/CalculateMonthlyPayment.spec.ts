import { CalculateMonthlyPayment } from '../CalculateMonthlyPayment';

describe('CalculateMonthlyPayment', () => {
  it('calculates monthly payment for non-zero rate', () => {
    const calc = new CalculateMonthlyPayment();
    const monthly = calc.execute(10000, 5, 24);
    expect(typeof monthly).toBe('number');
    expect(monthly).toBeGreaterThan(0);
  });

  it('calculates monthly payment for zero rate', () => {
    const calc = new CalculateMonthlyPayment();
    const monthly = calc.execute(1200, 0, 12);
    expect(monthly).toBe(100);
  });
});
