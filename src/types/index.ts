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
  createdAt: string;
  updatedAt: string;
}

export interface WaiterCall {
  id: string;
  tableId: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}
