-- Table for Waiters and Cashiers (Managed by Admin)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('waiter', 'cashier')),
    pin_code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking expenses and utilities
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    description TEXT,
    payment_method TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for testing
DROP POLICY IF EXISTS "Allow all on employees" ON public.employees;
CREATE POLICY "Allow all on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on expenses" ON public.expenses;
CREATE POLICY "Allow all on expenses" ON public.expenses FOR ALL USING (true);

-- Fix RLS for orders and order_items so Cashier/Waiter (PIN login) can read them
DROP POLICY IF EXISTS "Staff can do everything" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert for orders" ON public.orders;
CREATE POLICY "Allow all on orders" ON public.orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Staff can do everything" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert for order items" ON public.order_items;
CREATE POLICY "Allow all on order items" ON public.order_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Staff can do everything" ON public.waiter_calls;
DROP POLICY IF EXISTS "Allow public insert for waiter calls" ON public.waiter_calls;
CREATE POLICY "Allow all on waiter calls" ON public.waiter_calls FOR ALL USING (true);


-- Update orders to link waiter_id to employees instead of profiles
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_waiter_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_waiter_id_fkey FOREIGN KEY (waiter_id) REFERENCES public.employees(id) ON DELETE SET NULL;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text;
