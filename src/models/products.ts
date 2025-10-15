export interface Product {
  id: number;
  name: string;
  price: number;
  warehouses?: {
    warehouseId?: number;
    stock?: number;
  }[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
