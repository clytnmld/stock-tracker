export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  warehouseId: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
