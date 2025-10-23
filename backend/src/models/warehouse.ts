export interface Warehouse {
  id: number;
  name: string;
  totalStock?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
