import { Portfolio } from '../Portfolio';

describe('Portfolio entity', () => {
  it('throws on negative initial quantity', () => {
    expect(() => new Portfolio('u1', 's1', -1, 10)).toThrow('Quantity cannot be negative');
  });

  it('adds stocks and recalculates average price', () => {
    const p = new Portfolio('u1', 's1', 10, 10);
    p.addStocks(10, 20);
    expect(p.quantity).toBe(20);
    expect(p.averagePurchasePrice).toBeCloseTo(15, 5);
  });

  it('throws when adding non-positive quantity', () => {
    const p = new Portfolio('u1', 's1', 5, 10);
    expect(() => p.addStocks(0, 10)).toThrow('Quantity to add must be greater than 0');
    expect(() => p.addStocks(-5, 10)).toThrow('Quantity to add must be greater than 0');
  });

  it('throws when removing more stocks than available', () => {
    const p = new Portfolio('u1', 's1', 5, 10);
    expect(() => p.removeStocks(6)).toThrow('Cannot remove more stocks than available');
  });

  it('throws when removing non-positive quantity', () => {
    const p = new Portfolio('u1', 's1', 5, 10);
    expect(() => p.removeStocks(0)).toThrow('Quantity to remove must be greater than 0');
    expect(() => p.removeStocks(-3)).toThrow('Quantity to remove must be greater than 0');
  });
});
