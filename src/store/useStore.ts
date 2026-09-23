import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Category, MenuItem, Table, User, Order, WaiterCall } from '../types';

interface StoreState {
  users: User[];
  categories: Category[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  waiterCalls: WaiterCall[];
  isLoading: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  
  updateTableStatus: (id: string, status: Table['status']) => void;
  
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  createWaiterCall: (tableId: string) => void;
  resolveWaiterCall: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  users: [],
  categories: [],
  menuItems: [],
  tables: [],
  orders: [],
  waiterCalls: [],
  isLoading: true,

  fetchInitialData: async () => {
    try {
      set({ isLoading: true });
      
      const [
        { data: profilesData },
        { data: categoriesData },
        { data: menuItemsData },
        { data: tablesData },
        { data: ordersData },
        { data: orderItemsData },
        { data: callsData }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('menu_categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*'),
        supabase.from('tables').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('order_items').select('*'),
        supabase.from('waiter_calls').select('*')
      ]);

      const users: User[] = (profilesData || []).map(p => ({
        id: p.id,
        name: p.full_name,
        role: p.role
      }));

      const categories: Category[] = (categoriesData || []).map(c => ({
        id: c.id,
        name: c.name
      }));

      const menuItems: MenuItem[] = (menuItemsData || []).map(m => ({
        id: m.id,
        categoryId: m.category_id,
        name: m.name,
        description: m.description || '',
        price: Number(m.price),
        image: m.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
        isAvailable: m.is_available
      }));

      const tables: Table[] = (tablesData || []).map(t => ({
        id: t.id,
        number: t.table_number, // Might be text in DB, keeping as is for mapping
        status: ['available', 'occupied', 'ordered', 'cleaning', 'closed'].includes(t.status) ? t.status as any : 'available',
        seats: t.capacity
      }));

      const orders: Order[] = (ordersData || []).map(o => {
        const items = (orderItemsData || []).filter(oi => oi.order_id === o.id).map(oi => ({
          id: oi.id,
          menuItemId: oi.menu_item_id,
          quantity: oi.quantity,
          price: Number(oi.unit_price),
          notes: oi.special_instructions || ''
        }));
        
        return {
          id: o.id,
          tableId: o.table_id || '',
          waiterId: o.waiter_id,
          status: o.status,
          items,
          totalAmount: Number(o.total_amount),
          createdAt: o.created_at,
          updatedAt: o.updated_at
        };
      });

      const waiterCalls: WaiterCall[] = (callsData || []).map(c => ({
        id: c.id,
        tableId: c.table_id || '',
        status: c.status === 'new' ? 'pending' : 'resolved',
        createdAt: c.created_at
      }));

      set({ users, categories, menuItems, tables, orders, waiterCalls, isLoading: false });

      // Subscribe to real-time changes
      supabase.channel('public:orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
         get().fetchInitialData();
      }).subscribe();
      
      supabase.channel('public:waiter_calls').on('postgres_changes', { event: '*', schema: 'public', table: 'waiter_calls' }, () => {
         get().fetchInitialData();
      }).subscribe();

    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      set({ isLoading: false });
    }
  },

  addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (updated) => set((state) => ({ categories: state.categories.map(c => c.id === updated.id ? updated : c) })),
  deleteCategory: (id) => set((state) => ({ categories: state.categories.filter(c => c.id !== id) })),

  addMenuItem: (item) => set((state) => ({ menuItems: [...state.menuItems, item] })),
  updateMenuItem: (updated) => set((state) => ({ menuItems: state.menuItems.map(m => m.id === updated.id ? updated : m) })),
  deleteMenuItem: async (id) => {
    await supabase.from('menu_items').delete().eq('id', id);
    set((state) => ({ menuItems: state.menuItems.filter(m => m.id !== id) }));
  },

  updateTableStatus: async (id, status) => {
    await supabase.from('tables').update({ status }).eq('id', id);
    set((state) => ({ tables: state.tables.map(t => t.id === id ? { ...t, status } : t) }));
  },

  createOrder: async (orderData) => {
    // Optimistic UI update could be placed here, but we will rely on DB for real id
    const { data: orderResponse } = await supabase.from('orders').insert({
      table_id: orderData.tableId,
      waiter_id: orderData.waiterId || null,
      status: 'new',
      total_amount: orderData.totalAmount
    }).select().single();

    if (orderResponse) {
      const itemsToInsert = orderData.items.map(item => ({
        order_id: orderResponse.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));
      await supabase.from('order_items').insert(itemsToInsert);
      
      // Update table status to occupied
      await supabase.from('tables').update({ status: 'occupied' }).eq('id', orderData.tableId);
      
      // Refresh state
      get().fetchInitialData();
    }
  },
  
  updateOrderStatus: async (id, status) => {
    const dbStatus = status === 'paid' ? 'paid' : status === 'cancelled' ? 'cancelled' : 'accepted'; 
    await supabase.from('orders').update({ status: dbStatus, updated_at: new Date().toISOString() }).eq('id', id);
    get().fetchInitialData();
  },

  createWaiterCall: async (tableId) => {
    await supabase.from('waiter_calls').insert({ table_id: tableId, call_type: 'call_waiter', status: 'new' });
    get().fetchInitialData();
  },
  
  resolveWaiterCall: async (id) => {
    await supabase.from('waiter_calls').update({ status: 'completed', resolved_at: new Date().toISOString() }).eq('id', id);
    get().fetchInitialData();
  }
}));
