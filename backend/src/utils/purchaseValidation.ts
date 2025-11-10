export function purchasePostValidation(
  value: number,
  warehouseId: number,
  product: any
) {
  if (!value) return 'Value is required';
  if (isNaN(value) || isNaN(warehouseId)) {
    return 'Value must be a number';
  }
  if (isNaN(warehouseId)) {
    return 'Warehouse id must be a number';
  }
  if (value <= 0) {
    return 'Value must be a positive number';
  }
  if (!warehouseId) return 'warehouseId is required';
  if (!product) return 'Product not found';
  if (product.isDeleted) return 'Product has been deleted';
  return null;
}
