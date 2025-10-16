import { Advisor } from '../Advisor';

describe('Advisor entity', () => {
  it('creates advisor instance', () => {
    const a = new Advisor({ id: 'adv1', email: 'x@y.com', password: 'p', firstName: 'F', lastName: 'L' });
    expect(a.email).toBe('x@y.com');
  });
});
