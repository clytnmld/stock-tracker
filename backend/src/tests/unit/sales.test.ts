import { describe, it, expect } from 'vitest';
import { salesPostValidation } from '../../utils/salesValidation';

describe('Sales post validation test', () => {
  it('Should show warehouse id is required when its not given', () => {
    const error = salesPostValidation({}, 0, {}, 10);
    expect(error).toBe('warehouseId is required');
  });
  it('Should show warehouse relation not found for this product when relation is undefined', () => {
    const error = salesPostValidation({}, 1, undefined, 10);
    expect(error).toBe('Warehouse relation not found for this product');
  });
  it('Should show warehouse relation not found when relation is null', () => {
    const error = salesPostValidation({}, 1, null, 10);
    expect(error).toBe('Warehouse relation not found');
  });
  it('Should show stock not enough to do sales when stock is less than value', () => {
    const relation = { stock: 5 };
    const error = salesPostValidation({}, 1, relation, 10);
    expect(error).toBe('Stock not enough to do sales');
  });
  it('Should show value must be a positive number when value is negative', () => {
    const relation = { stock: 20 };
    const error = salesPostValidation({}, 1, relation, -5);
    expect(error).toBe('value must be a positive number');
  });
  it('Should show product has been deleted when product is deleted', () => {
    const relation = { stock: 20 };
    const product = { isDeleted: true };
    const error = salesPostValidation(product, 1, relation, 5);
    expect(error).toBe('Pruduct has been deleted');
  });
  it('Should return null when all inputs are valid', () => {
    const relation = { stock: 20 };
    const product = { isDeleted: false };
    const error = salesPostValidation(product, 1, relation, 5);
    expect(error).toBeNull();
  });
});
