import { describe, it, expect } from 'vitest';
import {
  productPostValidator,
  productPutValidator,
} from '../../utils/productValidation';

describe('productPostValidator', () => {
  it('should return error if name or price is missing', async () => {
    expect(await productPostValidator('', 100, [])).toBe(
      'Name, price and stock are required'
    );
    expect(await productPostValidator('Product', null as any, [])).toBe(
      'Name, price and stock are required'
    );
  });

  it('should return error if name is not a string', async () => {
    expect(await productPostValidator(123 as any, 100, [])).toBe(
      'Name need to be string'
    );
  });

  it('should return error if price is negative', async () => {
    expect(await productPostValidator('Product', -5, [])).toBe(
      'Price must be a positive number'
    );
  });

  it('should return error if warehouseId is missing', async () => {
    const warehouses = [{ stock: 5 }];
    expect(await productPostValidator('Product', 100, warehouses as any)).toBe(
      'warehouseId is required'
    );
  });

  it('should return error if stock is not a positive number', async () => {
    const warehouses = [{ warehouseId: 1, stock: -3 }];
    expect(await productPostValidator('Product', 100, warehouses as any)).toBe(
      'Stock need to be a positive number'
    );
  });

  it('should return null for valid input', async () => {
    const warehouses = [{ warehouseId: 1, stock: 5 }];
    expect(
      await productPostValidator('Product', 100, warehouses as any)
    ).toBeNull();
  });
});

describe('productPutValidator', () => {
  it('should return error if name, price, or warehouses are missing', async () => {
    expect(await productPutValidator('', 100, [])).toBe(
      'Name, price, and warehouses are required'
    );
    expect(await productPutValidator('Product', null as any, [])).toBe(
      'Name, price, and warehouses are required'
    );
    expect(await productPutValidator('Product', 100, null as any)).toBe(
      'Name, price, and warehouses are required'
    );
  });

  it('should return undefined for valid input', async () => {
    const warehouses = [{ warehouseId: 1, stock: 10 }];
    expect(
      await productPutValidator('Product', 100, warehouses as any)
    ).toBeUndefined();
  });
});
