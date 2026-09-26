import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  visits: number;
  spent: number;
  isVip: boolean;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  tableNumber: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface Invoice {
  id: string;
  supplier: string;
  date: string;
  amount: number;
  status: 'To\'langan' | 'Kutilmoqda';
}

export interface Purchase {
  id: string;
  item: string;
  quantity: string;
  price: number;
  total: number;
  date: string;
  user: string;
}

interface LocalStoreState {
  customers: Customer[];
  reservations: Reservation[];
  invoices: Invoice[];
  purchases: Purchase[];

  addCustomer: (customer: Omit<Customer, 'id' | 'visits' | 'spent' | 'isVip'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;

  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  deleteReservation: (id: string) => void;

  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  deleteInvoice: (id: string) => void;

  addPurchase: (purchase: Omit<Purchase, 'id'>) => void;
  deletePurchase: (id: string) => void;
}

export const useLocalStore = create<LocalStoreState>()(
  persist(
    (set) => ({
      customers: [
        { id: '1', name: 'Sardorbek', phone: '+998 90 123 45 67', visits: 12, spent: 450000, isVip: true },
        { id: '2', name: 'Aziz', phone: '+998 91 987 65 43', visits: 5, spent: 150000, isVip: false },
      ],
      reservations: [
        { id: '1', name: 'Sardor', phone: '+998 90 123 45 67', date: '2026-09-27', time: '19:00', guests: 4, tableNumber: 5, status: 'upcoming' },
      ],
      invoices: [
        { id: 'INV-2026-001', supplier: 'Meva-Cheva MChJ', date: '2026-09-25', amount: 1250000, status: 'To\'langan' },
      ],
      purchases: [
        { id: 'PUR-001', item: 'Mol go\'shti (lahm)', quantity: '50 kg', price: 85000, total: 4250000, date: '2026-09-27 08:30', user: 'Admin' },
      ],

      addCustomer: (c) => set((state) => ({ 
        customers: [...state.customers, { ...c, id: Date.now().toString(), visits: 0, spent: 0, isVip: false }] 
      })),
      updateCustomer: (c) => set((state) => ({ 
        customers: state.customers.map(cust => cust.id === c.id ? c : cust) 
      })),
      deleteCustomer: (id) => set((state) => ({ 
        customers: state.customers.filter(c => c.id !== id) 
      })),

      addReservation: (r) => set((state) => ({ 
        reservations: [...state.reservations, { ...r, id: Date.now().toString() }] 
      })),
      updateReservationStatus: (id, status) => set((state) => ({ 
        reservations: state.reservations.map(r => r.id === id ? { ...r, status } : r) 
      })),
      deleteReservation: (id) => set((state) => ({ 
        reservations: state.reservations.filter(r => r.id !== id) 
      })),

      addInvoice: (inv) => set((state) => ({ 
        invoices: [...state.invoices, { ...inv, id: `INV-${Date.now()}` }] 
      })),
      updateInvoiceStatus: (id, status) => set((state) => ({ 
        invoices: state.invoices.map(inv => inv.id === id ? { ...inv, status } : inv) 
      })),
      deleteInvoice: (id) => set((state) => ({ 
        invoices: state.invoices.filter(inv => inv.id !== id) 
      })),

      addPurchase: (p) => set((state) => ({ 
        purchases: [...state.purchases, { ...p, id: `PUR-${Date.now()}` }] 
      })),
      deletePurchase: (id) => set((state) => ({ 
        purchases: state.purchases.filter(p => p.id !== id) 
      })),
    }),
    {
      name: 'isfaryam-local-store', // name of item in the storage (must be unique)
    }
  )
);
