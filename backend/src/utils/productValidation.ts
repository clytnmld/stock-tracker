export async function productPostValidator(
  name: string,
  price: number,
  warehouses: []
) {
  if (!name || price == null) return 'Name, price and stock are required';
  if (typeof name !== 'string') return 'Name need to be string';
  if (price < 0) return 'Price must be a positive number';
  if (warehouses && warehouses.length > 0) {
    for (const { warehouseId, stock } of warehouses) {
      const stockNum = Number(stock);

      if (!warehouseId) {
        return 'warehouseId is required';
      }

      if (isNaN(stockNum) || stockNum < 0) {
        return 'Stock need to be a positive number';
      }
    }
  }
  return null;
}

export async function productPutValidator(
  name: string,
  price: number,
  warehouses: []
) {
  if (!name || price == null || !Array.isArray(warehouses)) {
    return 'Name, price, and warehouses are required';
  }
}
