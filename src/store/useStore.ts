import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Category, MenuItem, Table, User, Order, WaiterCall, Employee, Expense, InventoryItem, RecipeIngredient, InventoryTransaction, NotebookEntry } from '../types';

interface StoreState {
  users: User[];
  categories: Category[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  waiterCalls: WaiterCall[];
  employees: Employee[];
  expenses: Expense[];
  inventoryItems: InventoryItem[];
  recipeIngredients: RecipeIngredient[];
  inventoryTransactions: InventoryTransaction[];
  notebookEntries: NotebookEntry[];
  isLoading: boolean;
  isRealtimeInitialized: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  initRealtime: () => void;
  
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  
  updateTableStatus: (id: string, status: Table['status']) => void;
  
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addItemsToOrder: (orderId: string, items: any[], additionalAmount: number) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status'], paymentMethod?: 'cash' | 'card') => void;
  
  createWaiterCall: (tableId: string) => void;
  resolveWaiterCall: (id: string) => void;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (item: InventoryItem) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addInventoryTransaction: (transaction: Omit<InventoryTransaction, 'id'>) => Promise<void>;
  setRecipe: (menuItemId: string, ingredients: Omit<RecipeIngredient, 'id'>[]) => Promise<void>;

  // Notebook actions
  addNotebookEntry: (entry: Omit<NotebookEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNotebookEntryStatus: (id: string, status: NotebookEntry['status']) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  users: [],
  categories: [],
  menuItems: [],
  tables: [],
  orders: [],
  waiterCalls: [],
  employees: [],
  expenses: [],
  inventoryItems: [],
  recipeIngredients: [],
  inventoryTransactions: [],
  notebookEntries: [],
  isLoading: true,
  isRealtimeInitialized: false,

  initRealtime: () => {
    if (get().isRealtimeInitialized) return;
    set({ isRealtimeInitialized: true });
    
    supabase.channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
         get().fetchInitialData();
      }).subscribe();
      
    supabase.channel('public:waiter_calls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiter_calls' }, () => {
         get().fetchInitialData();
      }).subscribe();
  },

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
        { data: callsData },
        { data: employeesData },
        { data: expensesData },
        { data: inventoryItemsData },
        { data: recipeIngredientsData },
        { data: inventoryTransactionsData },
        { data: notebookEntriesData }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('menu_categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*'),
        supabase.from('tables').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('order_items').select('*'),
        supabase.from('waiter_calls').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('expenses').select('*').order('payment_date', { ascending: false }),
        supabase.from('inventory_items').select('*'),
        supabase.from('recipe_ingredients').select('*'),
        supabase.from('inventory_transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('notebook_entries').select('*').order('created_at', { ascending: false })
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
          paymentMethod: o.payment_method,
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

      const employees: Employee[] = (employeesData || []).map(e => ({
        id: e.id,
        fullName: e.full_name,
        role: e.role,
        pinCode: e.pin_code,
        isActive: e.is_active,
        createdAt: e.created_at
      }));

      const expenses: Expense[] = (expensesData || []).map(e => ({
        id: e.id,
        category: e.category,
        amount: Number(e.amount),
        paymentDate: e.payment_date,
        description: e.description,
        paymentMethod: e.payment_method,
        createdAt: e.created_at
      }));

      const inventoryItems: InventoryItem[] = (inventoryItemsData || []).map(i => ({
        id: i.id,
        name: i.name,
        unit: i.unit,
        currentStock: Number(i.current_stock),
        minStockLevel: Number(i.min_stock_level),
        purchasePrice: i.purchase_price ? Number(i.purchase_price) : undefined,
        supplier: i.supplier,
        createdAt: i.created_at,
        updatedAt: i.updated_at
      }));

      const recipeIngredients: RecipeIngredient[] = (recipeIngredientsData || []).map(r => ({
        id: r.id,
        menuItemId: r.menu_item_id,
        inventoryItemId: r.inventory_item_id,
        quantity: Number(r.quantity),
        notes: r.notes
      }));

      const inventoryTransactions: InventoryTransaction[] = (inventoryTransactionsData || []).map(t => ({
        id: t.id,
        itemId: t.item_id,
        transactionType: t.transaction_type,
        quantity: Number(t.quantity),
        referenceId: t.notes, // Schema stores reference in notes or something, wait we didn't use referenceId in schema, but we can store it in notes
        createdAt: t.created_at
      }));

      const notebookEntries: NotebookEntry[] = (notebookEntriesData || []).map(n => ({
        id: n.id,
        type: n.type,
        personName: n.person_name,
        amount: Number(n.amount),
        notes: n.notes,
        status: n.status,
        createdAt: n.created_at,
        updatedAt: n.updated_at
      }));

      set({ 
        users, categories, menuItems, tables, orders, waiterCalls, employees, expenses, 
        inventoryItems, recipeIngredients, inventoryTransactions, notebookEntries,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      set({ isLoading: false });
    }
  },

  addCategory: async (category) => {
    await supabase.from('menu_categories').insert({ name: category.name, sort_order: 0 });
    get().fetchInitialData();
  },
  
  updateCategory: async (updated) => {
    await supabase.from('menu_categories').update({ name: updated.name }).eq('id', updated.id);
    get().fetchInitialData();
  },
  
  deleteCategory: async (id) => {
    await supabase.from('menu_categories').delete().eq('id', id);
    get().fetchInitialData();
  },

  addMenuItem: async (item) => {
    await supabase.from('menu_items').insert({
      category_id: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image,
      is_available: item.isAvailable
    });
    get().fetchInitialData();
  },
  
  updateMenuItem: async (updated) => {
    await supabase.from('menu_items').update({
      category_id: updated.categoryId,
      name: updated.name,
      description: updated.description,
      price: updated.price,
      image_url: updated.image,
      is_available: updated.isAvailable
    }).eq('id', updated.id);
    get().fetchInitialData();
  },
  
  deleteMenuItem: async (id) => {
    await supabase.from('menu_items').delete().eq('id', id);
    get().fetchInitialData();
  },

  updateTableStatus: async (id, status) => {
    await supabase.from('tables').update({ status }).eq('id', id);
    set((state) => ({ tables: state.tables.map(t => t.id === id ? { ...t, status } : t) }));
  },

  createOrder: async (orderData) => {
    // Optimistic UI update for immediate feedback
    if (orderData.tableId !== 'takeaway') {
      set((state) => ({ tables: state.tables.map(t => t.id === orderData.tableId ? { ...t, status: 'occupied' } : t) }));
    }

    // Optimistic UI update could be placed here, but we will rely on DB for real id
    const { data: orderResponse } = await supabase.from('orders').insert({
      table_id: orderData.tableId === 'takeaway' ? null : orderData.tableId,
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
      if (orderData.tableId !== 'takeaway') {
        await supabase.from('tables').update({ status: 'occupied' }).eq('id', orderData.tableId);
      }
      
      // Inventory Deduction Logic
      const { recipeIngredients, inventoryItems } = get();
      
      for (const item of orderData.items) {
        const recipes = recipeIngredients.filter(r => r.menuItemId === item.menuItemId);
        for (const recipe of recipes) {
          const invItem = inventoryItems.find(i => i.id === recipe.inventoryItemId);
          if (invItem) {
            const totalQuantityToDeduct = recipe.quantity * item.quantity;
            const newStock = invItem.currentStock - totalQuantityToDeduct;
            
            await supabase.from('inventory_transactions').insert({
              item_id: invItem.id,
              transaction_type: 'out',
              quantity: totalQuantityToDeduct,
              notes: `Zakaz #${orderResponse.id.slice(0, 8)}`
            });
            await supabase.from('inventory_items').update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq('id', invItem.id);
          }
        }
      }

      // Refresh state
      get().fetchInitialData();
    }
  },

  addItemsToOrder: async (orderId, items, additionalAmount) => {
    // 1. Insert new items
    const itemsToInsert = items.map(item => ({
      order_id: orderId,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));
    await supabase.from('order_items').insert(itemsToInsert);

    // 2. Fetch current order to update total amount
    const { data: orderData } = await supabase.from('orders').select('total_amount').eq('id', orderId).single();
    if (orderData) {
      const newTotal = Number(orderData.total_amount) + additionalAmount;
      await supabase.from('orders').update({ total_amount: newTotal, updated_at: new Date().toISOString() }).eq('id', orderId);
    }

    // Inventory Deduction Logic
    const { recipeIngredients, inventoryItems } = get();
    
    for (const item of items) {
      const recipes = recipeIngredients.filter(r => r.menuItemId === item.menuItemId);
      for (const recipe of recipes) {
        const invItem = inventoryItems.find(i => i.id === recipe.inventoryItemId);
        if (invItem) {
          const totalQuantityToDeduct = recipe.quantity * item.quantity;
          const newStock = invItem.currentStock - totalQuantityToDeduct;
          
          await supabase.from('inventory_transactions').insert({
            item_id: invItem.id,
            transaction_type: 'out',
            quantity: totalQuantityToDeduct,
            notes: `Qo'shimcha zakaz #${orderId.slice(0, 8)}`
          });
          await supabase.from('inventory_items').update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq('id', invItem.id);
        }
      }
    }

    get().fetchInitialData();
  },

  
  updateOrderStatus: async (id, status, paymentMethod) => {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (paymentMethod) updateData.payment_method = paymentMethod;
    await supabase.from('orders').update(updateData).eq('id', id);
    get().fetchInitialData();
  },

  createWaiterCall: async (tableId) => {
    await supabase.from('waiter_calls').insert({ table_id: tableId, call_type: 'call_waiter', status: 'new' });
    get().fetchInitialData();
  },
  
  resolveWaiterCall: async (id) => {
    await supabase.from('waiter_calls').update({ status: 'completed', resolved_at: new Date().toISOString() }).eq('id', id);
    get().fetchInitialData();
  },

  addEmployee: async (employee) => {
    const { error } = await supabase.from('employees').insert({
      full_name: employee.fullName,
      role: employee.role,
      pin_code: employee.pinCode,
      is_active: employee.isActive
    });
    if (!error) {
      get().fetchInitialData();
    } else {
      console.error(error);
      alert("Xodim qo'shishda xatolik: " + error.message);
    }
  },

  updateEmployee: async (employee) => {
    const { error } = await supabase.from('employees').update({
      full_name: employee.fullName,
      role: employee.role,
      pin_code: employee.pinCode,
      is_active: employee.isActive
    }).eq('id', employee.id);
    if (!error) get().fetchInitialData();
    else console.error(error);
  },

  deleteEmployee: async (id) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) get().fetchInitialData();
    else console.error(error);
  },

  addExpense: async (expense) => {
    const { error } = await supabase.from('expenses').insert({
      category: expense.category,
      amount: expense.amount,
      payment_date: expense.paymentDate,
      description: expense.description || null,
      payment_method: expense.paymentMethod
    });
    if (!error) get().fetchInitialData();
    else console.error(error);
  },

  deleteExpense: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) get().fetchInitialData();
    else console.error(error);
  },

  addInventoryItem: async (item) => {
    const { error } = await supabase.from('inventory_items').insert({
      name: item.name,
      unit: item.unit,
      current_stock: item.currentStock,
      min_stock_level: item.minStockLevel,
      purchase_price: item.purchasePrice || null,
      supplier: item.supplier || null
    });
    if (!error) get().fetchInitialData();
    else console.error(error);
  },

  updateInventoryItem: async (item) => {
    const { error } = await supabase.from('inventory_items').update({
      name: item.name,
      unit: item.unit,
      current_stock: item.currentStock,
      min_stock_level: item.minStockLevel,
      purchase_price: item.purchasePrice || null,
      supplier: item.supplier || null,
      updated_at: new Date().toISOString()
    }).eq('id', item.id);
    if (!error) get().fetchInitialData();
    else console.error(error);
  },

  deleteInventoryItem: async (id) => {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (!error) get().fetchInitialData();
    else console.error(error);
  },

  addInventoryTransaction: async (tx) => {
    const { error: txError } = await supabase.from('inventory_transactions').insert({
      item_id: tx.itemId,
      transaction_type: tx.transactionType,
      quantity: tx.quantity,
      notes: tx.referenceId || null
    });

    if (!txError) {
      // Also update stock
      const item = get().inventoryItems.find(i => i.id === tx.itemId);
      if (item) {
        const newStock = tx.transactionType === 'in' ? item.currentStock + tx.quantity : 
                         tx.transactionType === 'out' ? item.currentStock - tx.quantity : 
                         item.currentStock; // For adjustment, quantity might be the absolute difference, or we can just use set
        if (tx.transactionType !== 'adjustment') {
          await supabase.from('inventory_items').update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq('id', item.id);
        } else {
          await supabase.from('inventory_items').update({ current_stock: tx.quantity, updated_at: new Date().toISOString() }).eq('id', item.id);
        }
      }
      get().fetchInitialData();
    } else {
      console.error(txError);
    }
  },

  setRecipe: async (menuItemId, ingredients) => {
    // Delete existing recipe ingredients for this menu item
    await supabase.from('recipe_ingredients').delete().eq('menu_item_id', menuItemId);
    
    if (ingredients.length > 0) {
      const { error } = await supabase.from('recipe_ingredients').insert(ingredients.map(ing => ({
        menu_item_id: ing.menuItemId,
        inventory_item_id: ing.inventoryItemId,
        quantity: ing.quantity,
        notes: ing.notes || null
      })));
      if (error) console.error(error);
    }
    
    get().fetchInitialData();
  },

  addNotebookEntry: async (entry) => {
    const { error } = await supabase.from('notebook_entries').insert({
      type: entry.type,
      person_name: entry.personName,
      amount: entry.amount,
      notes: entry.notes || null,
      status: entry.status
    });
    if (!error) get().fetchInitialData();
    else console.error(error);
  },

  updateNotebookEntryStatus: async (id, status) => {
    const { error } = await supabase.from('notebook_entries').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) get().fetchInitialData();
    else console.error(error);
  }
}));
