import { Stock } from '../Stock';

describe('Stock entity', () => {
  it('validates symbol and toggles availability', () => {
    const s = new Stock('st1', 'AAPL', 'Apple', 'Apple Inc', false);
    expect(s.isAvailable).toBe(false);
    s.makeAvailable();
    expect(s.isAvailable).toBe(true);
    s.makeUnavailable();
    expect(s.isAvailable).toBe(false);
  });

  it('throws on empty symbol', () => {
    expect(() => new Stock('st2', '   ', 'Name', 'Company', true)).toThrow();
  });
});
