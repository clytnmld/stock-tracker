export function warehousePostValidation(name: any): string | null {
  if (!name) return 'Name is required';
  if (typeof name !== 'string') return 'Name must be a string';
  if (name.trim().length === 0) {
    return 'Name is required';
  }
  return null;
}

export function warehousePutValidation(name: any, warehouse: any) {
  if (!warehouse) {
    return 'Warehouse not found';
  }
  if (!name) {
    return 'Name is required';
  }
  if (typeof name !== 'string') {
    return 'Name must be a string';
  }
}

export function warehouseDeleteValidation(warehouse: any) {
  if (!warehouse) {
    return 'Warehouse not found';
  }
  if (warehouse.totalStock > 0) {
    return 'Cannot delete warehouse with existing stock please delete the product that still exist in this warehouse first';
  }
}
