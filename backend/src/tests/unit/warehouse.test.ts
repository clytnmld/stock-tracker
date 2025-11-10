import {
  warehouseDeleteValidation,
  warehousePostValidation,
  warehousePutValidation,
} from '../../utils/warehouseValidation';
import { describe, it, expect } from 'vitest';

describe('warehouse post validation', () => {
  it('should return error if name is missing', () => {
    const result = warehousePostValidation(undefined);
    expect(result).toBe('Name is required');
  });

  it('should return error if name is empty string', () => {
    const result = warehousePostValidation(' ');
    expect(result).toBe('Name is required');
  });

  it('should return error if name is not a string', () => {
    const result = warehousePostValidation(123);
    expect(result).toBe('Name must be a string');
  });

  it('should return null for valid name', () => {
    const result = warehousePostValidation('Main Warehouse');
    expect(result).toBeNull();
  });
});

describe('warehouse put validation', () => {
  it('should return error if warehouse is not found', () => {
    const result = warehousePutValidation('New Name', null);
    expect(result).toBe('Warehouse not found');
  });

  it('should return error if name is missing', () => {
    const warehouse = { id: 1, name: 'Old Name' };
    const result = warehousePutValidation(undefined, warehouse);
    expect(result).toBe('Name is required');
  });

  it('should return error if name is not a string', () => {
    const warehouse = { id: 1, name: 'Old Name' };
    const result = warehousePutValidation(456, warehouse);
    expect(result).toBe('Name must be a string');
  });

  it('should return undefined for valid inputs', () => {
    const warehouse = { id: 1, name: 'Old Name' };
    const result = warehousePutValidation('New Name', warehouse);
    expect(result).toBeUndefined();
  });
});

describe('warehouse delete validation', () => {
  it('should return error if warehouse is not found', () => {
    const result = warehouseDeleteValidation(null);
    expect(result).toBe('Warehouse not found');
  });

  it('should return error if warehouse has existing stock', () => {
    const warehouse = { id: 1, name: 'Main Warehouse', totalStock: 10 };
    const result = warehouseDeleteValidation(warehouse);
    expect(result).toBe(
      'Cannot delete warehouse with existing stock please delete the product that still exist in this warehouse first'
    );
  });

  it('should return undefined for warehouse with zero stock', () => {
    const warehouse = { id: 1, name: 'Main Warehouse', totalStock: 0 };
    const result = warehouseDeleteValidation(warehouse);
    expect(result).toBeUndefined();
  });
});
