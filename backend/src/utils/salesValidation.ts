export function salesPostValidation(
  product: any,
  warehouseNum: number,
  relation: any,
  valueNum: number
) {
  if (!warehouseNum) return 'warehouseId is required';
  if (relation === undefined)
    return 'Warehouse relation not found for this product';
  if (!relation) return 'Warehouse relation not found';
  if (relation.stock < valueNum) return 'Stock not enough to do sales';
  if (valueNum < 0) return 'value must be a positive number';
  if (product.isDeleted) return 'Pruduct has been deleted';
  return null;
}
