import { describe, it, expect } from 'vitest';
import { purchasePostValidation } from '../../utils/purchaseValidation';

describe('Purchase post validation', () => {
  it('Should show error message value is needed', () => {
    const purchase = purchasePostValidation(NaN, 1, []);
    expect(purchase).toBe('Value is required');
  });

  it('Should show error message value needs to be a positive number', () => {
    const purchase = purchasePostValidation(-1, 1, []);
    expect(purchase).toBe('Value must be a positive number');
  });

  it('Should show error message product cannot be found', () => {
    const purchase = purchasePostValidation(1, 1, null);
    expect(purchase).toBe('Product not found');
  });

  it('Should show error message product has been deleted', () => {
    const purchase = purchasePostValidation(1, 1, { isDeleted: true });
    expect(purchase).toBe('Product has been deleted');
  });
});
