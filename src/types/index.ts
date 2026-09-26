export type Role = 'admin' | 'cashier' | 'waiter';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

export interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved';
  seats: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number; // price at the time of order
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  waiterId?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  paymentMethod?: 'cash' | 'card' | 'mixed';
  cashAmount?: number;
  cardAmount?: number;
  discountAmount?: number;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaiterCall {
  id: string;
  tableId: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface Employee {
  id: string;
  fullName: string;
  role: 'waiter' | 'cashier';
  pinCode: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  paymentDate: string;
  description?: string;
  paymentMethod: string;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string; // kg, litr, dona, metr
  currentStock: number;
  minStockLevel: number;
  purchasePrice?: number;
  supplier?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  id: string;
  menuItemId: string;
  inventoryItemId: string;
  quantity: number;
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  transactionType: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceId?: string; // Order ID if it was sold
  createdAt?: string;
}

export interface NotebookEntry {
  id: string;
  type: 'debt' | 'advance';
  personName: string;
  amount: number;
  notes?: string;
  status: 'unpaid' | 'paid';
  createdAt?: string;
  updatedAt?: string;
}
