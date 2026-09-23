-- ==========================================
-- RESTAURANT POS FULL DATABASE SCHEMA
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & PROFILES
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cashier', 'waiter', 'kitchen')),
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ZONES & TABLES
CREATE TABLE public.zones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., 'Ko''cha', 'Kabinkalar', 'Ichki zal'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'ordered', 'cleaning', 'closed')),
    qr_code_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (zone_id, table_number)
);

-- 3. MENU
CREATE TABLE public.menu_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS & ORDER ITEMS
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    waiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Null if ordered via QR
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'preparing', 'ready', 'delivered', 'awaiting_payment', 'paid', 'cancelled')),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    special_instructions TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYMENTS
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'uzcard', 'humo', 'click', 'payme', 'bank_card')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RESERVATIONS (BRON)
CREATE TABLE public.reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guest_count INTEGER NOT NULL,
    preferred_zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    assigned_table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INVENTORY (OMBOR)
CREATE TABLE public.inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL, -- e.g., kg, litr, dona
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_stock_level DECIMAL(10,2) NOT NULL DEFAULT 0,
    purchase_price DECIMAL(12,2),
    supplier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.inventory_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
    quantity DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WAITER CALLS
CREATE TABLE public.waiter_calls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE,
    call_type TEXT NOT NULL CHECK (call_type IN ('call_waiter', 'request_bill', 'help_order', 'clean_table')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'completed')),
    assigned_waiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;

-- Note: We will add the actual RLS policies later. For initial development, we can create a permissive policy for authenticated users, or allow anon reads for customer facing menus.

CREATE POLICY "Allow public read for menu and zones" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read for menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public read for zones" ON public.zones FOR SELECT USING (true);
CREATE POLICY "Allow public read for tables" ON public.tables FOR SELECT USING (true);

-- Allow inserting orders & calls from public (Customers scanning QR)
CREATE POLICY "Allow public insert for orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert for order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert for waiter calls" ON public.waiter_calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert for reservations" ON public.reservations FOR INSERT WITH CHECK (true);

-- Authenticated staff can do everything for now
CREATE POLICY "Staff can do everything" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.zones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.tables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.menu_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.reservations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.inventory_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can do everything" ON public.waiter_calls FOR ALL USING (auth.role() = 'authenticated');
