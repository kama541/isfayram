import type { Category, MenuItem, Table, User, Order, WaiterCall } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Admin User', role: 'admin' },
  { id: '2', name: 'Cashier One', role: 'cashier' },
  { id: '3', name: 'Waiter Ali', role: 'waiter' },
  { id: '4', name: 'Waiter Vali', role: 'waiter' },
];

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Milliy Taomlar', image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&q=80&w=400' },
  { id: 'c2', name: 'Fast Food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
  { id: 'c3', name: 'Ichimliklar', image: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&q=80&w=400' },
  { id: 'c4', name: 'Shirinliklar', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=400' },
];

export const mockMenuItems: MenuItem[] = [
  {
    id: 'm1',
    categoryId: 'c1',
    name: 'Osh (Palov)',
    description: 'An\'anaviy o\'zbek palovi go\'sht, sabzi va mayiz bilan',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
  },
  {
    id: 'm2',
    categoryId: 'c1',
    name: 'Qozon Kabob',
    description: 'Qovurilgan go\'sht va kartoshka',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
  },
  {
    id: 'm3',
    categoryId: 'c2',
    name: 'Cheeseburger',
    description: 'Mol go\'shtidan kotlet, pishloq, maxsus sous',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
  },
  {
    id: 'm4',
    categoryId: 'c3',
    name: 'Coca Cola 1L',
    description: 'Yaxna ichimlik',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
  },
  {
    id: 'm5',
    categoryId: 'c3',
    name: 'Qora Choy',
    description: 'Limonli qora choy choynakda',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=400',
    isAvailable: true,
  },
];

export const mockTables: Table[] = [
  { id: 't1', number: 1, status: 'available', seats: 4 },
  { id: 't2', number: 2, status: 'occupied', seats: 4 },
  { id: 't3', number: 3, status: 'reserved', seats: 6 },
  { id: 't4', number: 4, status: 'available', seats: 2 },
  { id: 't5', number: 5, status: 'occupied', seats: 8 },
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    tableId: 't2',
    waiterId: '3',
    status: 'preparing',
    items: [
      { id: 'i1', menuItemId: 'm1', quantity: 2, price: 35000 },
      { id: 'i2', menuItemId: 'm5', quantity: 1, price: 5000 },
    ],
    totalAmount: 75000,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'o2',
    tableId: 't5',
    waiterId: '4',
    status: 'pending',
    items: [
      { id: 'i3', menuItemId: 'm2', quantity: 3, price: 45000 },
      { id: 'i4', menuItemId: 'm4', quantity: 2, price: 12000 },
    ],
    totalAmount: 159000,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  }
];

export const mockWaiterCalls: WaiterCall[] = [
  {
    id: 'wc1',
    tableId: 't2',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  }
];
