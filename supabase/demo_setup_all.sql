-- ==========================================
-- RESTAURANT POS FULL DATABASE SCHEMA
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to avoid "relation already exists" errors
DROP TABLE IF EXISTS public.waiter_calls CASCADE;
DROP TABLE IF EXISTS public.inventory_transactions CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.menu_categories CASCADE;
DROP TABLE IF EXISTS public.tables CASCADE;
DROP TABLE IF EXISTS public.zones CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.recipe_ingredients CASCADE;
DROP TABLE IF EXISTS public.general_settings CASCADE;
DROP TABLE IF EXISTS public.computer_devices CASCADE;
DROP TABLE IF EXISTS public.kitchen_stations CASCADE;
DROP TABLE IF EXISTS public.notebook_entries CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- 1. ROLES & PROFILES
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cashier', 'waiter', 'kitchen')),
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5. EMPLOYEES (Staff PIN Login without full Auth)
CREATE TABLE public.employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('cashier', 'waiter')),
    pin_code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6. EXPENSES (Finance and Utility Management)
CREATE TABLE public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('Elektr energiyasi', 'Gaz', 'Suv', 'Internet', 'Ijara', 'Ishchilar maoshi', 'Ta''mirlash xarajatlari', 'Boshqa')),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    description TEXT,
    payment_method TEXT NOT NULL,
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

CREATE TABLE public.recipe_ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity DECIMAL(10,3) NOT NULL,
    notes TEXT,
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

-- Temporary permissive policies for local testing without auth
CREATE POLICY "Allow all on employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Allow all on expenses" ON public.expenses FOR ALL USING (true);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
-- 9. NOTEBOOK (DAFTARCHA)
CREATE TABLE public.notebook_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('debt', 'advance')),
    person_name TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notebook_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on notebook_entries" ON public.notebook_entries FOR ALL USING (true);
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
-- KITCHEN STATIONS TABLE
CREATE TABLE IF NOT EXISTS public.kitchen_stations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADD KITCHEN_STATION_ID TO MENU_ITEMS
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS kitchen_station_id UUID REFERENCES public.kitchen_stations(id) ON DELETE SET NULL;

-- ADD STATION_IDS TO EMPLOYEES
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS kitchen_station_ids UUID[] DEFAULT '{}'::UUID[];

-- WE ALREADY HAVE order_items WITH status ('pending', 'preparing', 'ready', 'delivered')
-- LET'S ADD kitchen_station_id TO order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS kitchen_station_id UUID REFERENCES public.kitchen_stations(id) ON DELETE SET NULL;

-- ALSO WE NEED 'cooking' status instead of 'preparing' or we just use 'preparing'
-- Let's update the CHECK constraint on status if we really need 'cooking'
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_status_check;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_status_check CHECK (status IN ('pending', 'accepted', 'cooking', 'preparing', 'ready', 'delivered', 'cancelled'));

-- RLS POLICIES FOR KITCHEN STATIONS
ALTER TABLE public.kitchen_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.kitchen_stations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.kitchen_stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.kitchen_stations FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.kitchen_stations FOR DELETE USING (true);

-- ENABLE REALTIME ON kitchen_stations and order_items
-- Assuming order_items is already in publication, but let's make sure:
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.orders, public.order_items, public.waiter_calls, public.kitchen_stations;
COMMIT;
-- SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INITIAL SETTINGS
INSERT INTO public.settings (key, value, description) 
VALUES ('is_system_open', 'true', 'Restoran ochiq yoki yopiq ekanligini bildiradi')
ON CONFLICT (key) DO NOTHING;

-- RECIPE INGREDIENTS TABLE
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    ingredient_id UUID, -- Or REFERENCES public.ingredients if that table exists
    quantity DECIMAL NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTEBOOK ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.notebook_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.recipe_ingredients FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notebook_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.notebook_entries FOR SELECT USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.notebook_entries FOR ALL USING (true) WITH CHECK (true);
-- Migration 4: Computer Devices for Device Registration System

CREATE TABLE IF NOT EXISTS public.computer_devices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    computer_id TEXT NOT NULL UNIQUE,
    computer_name TEXT,
    assigned_role TEXT CHECK (assigned_role IN ('admin', 'cashier', 'waiter', 'kitchen', 'none')),
    status TEXT NOT NULL DEFAULT 'unregistered' CHECK (status IN ('unregistered', 'active', 'inactive')),
    registered_at TIMESTAMPTZ,
    registered_by UUID REFERENCES public.profiles(id),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE computer_devices;

-- RLS
ALTER TABLE public.computer_devices ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all devices
CREATE POLICY "Allow public read for computer_devices" ON public.computer_devices FOR SELECT USING (true);

-- Allow anyone to insert a new unregistered device (when they visit the site first time)
CREATE POLICY "Allow public insert for computer_devices" ON public.computer_devices FOR INSERT WITH CHECK (true);

-- Allow updates (to update last_seen_at or status)
CREATE POLICY "Allow updates for computer_devices" ON public.computer_devices FOR UPDATE USING (true);
-- 1. "Shashliklar" toifasini yaratish (agar yo'q bo'lsa)
INSERT INTO menu_categories (name, sort_order)
SELECT 'Shashliklar', 1
WHERE NOT EXISTS (
    SELECT 1 FROM menu_categories WHERE name = 'Shashliklar'
);

-- 2. "Taomlar" toifasini yaratish (agar yo'q bo'lsa)
INSERT INTO menu_categories (name, sort_order)
SELECT 'Taomlar', 2
WHERE NOT EXISTS (
    SELECT 1 FROM menu_categories WHERE name = 'Taomlar'
);

-- 3. "Baliqlar" toifasini yaratish (agar yo'q bo'lsa)
INSERT INTO menu_categories (name, sort_order)
SELECT 'Baliqlar', 3
WHERE NOT EXISTS (
    SELECT 1 FROM menu_categories WHERE name = 'Baliqlar'
);

-- 4. Barcha shashlik, kabob va go'shtli narsalarni "Shashliklar" toifasiga o'tkazish
UPDATE menu_items 
SET category_id = (SELECT id FROM menu_categories WHERE name = 'Shashliklar' LIMIT 1)
WHERE name ILIKE '%shashlik%' 
   OR name ILIKE '%kabob%' 
   OR name ILIKE '%qiyma%' 
   OR name ILIKE '%jiz%' 
   OR name ILIKE '%jaz%' 
   OR name ILIKE '%bifsteks%';

-- 5. Barcha baliqlarni "Baliqlar" toifasiga o'tkazish
UPDATE menu_items 
SET category_id = (SELECT id FROM menu_categories WHERE name = 'Baliqlar' LIMIT 1)
WHERE name ILIKE '%baliq%' 
   OR name ILIKE '%sazan%' 
   OR name ILIKE '%forel%' 
   OR name ILIKE '%sudak%' 
   OR name ILIKE '%amur%';

-- 6. Boshqa suyuq/quyuq taomlarni "Taomlar" toifasiga o'tkazish
UPDATE menu_items 
SET category_id = (SELECT id FROM menu_categories WHERE name = 'Taomlar' LIMIT 1)
WHERE name ILIKE '%osh%' 
   OR name ILIKE '%manti%' 
   OR name ILIKE '%lag''mon%' 
   OR name ILIKE '%lagmon%' 
   OR name ILIKE '%sho''rva%'
   OR name ILIKE '%shorva%'
   OR name ILIKE '%mastava%'
   OR name ILIKE '%dimlama%'
   OR name ILIKE '%chuchvara%';
-- ==============================================================================
-- DEMO SEED DATA FOR ISFAYRAM POS
-- Run this script ONLY in your newly created DEMO Supabase Database.
-- DO NOT RUN THIS IN PRODUCTION!
-- ==============================================================================

-- 1. Create Demo Categories
INSERT INTO public.menu_categories (id, name, sort_order) VALUES
('6b29fc40-ca47-1067-b31d-00dd010662da', 'Suyuq taomlar', 1),
('6b29fc40-ca47-1067-b31d-00dd010662db', 'Quyuq taomlar', 2),
('6b29fc40-ca47-1067-b31d-00dd010662dc', 'Ichimliklar', 3),
('6b29fc40-ca47-1067-b31d-00dd010662dd', 'Salatlar', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Demo Kitchen Stations (Assuming migration2 or migration3 creates kitchen_stations)
INSERT INTO public.kitchen_stations (id, name, description, is_active) VALUES
('4b29fc40-ca47-1067-b31d-00dd010662da', 'Asosiy Oshxona', 'Asosiy ovqatlar tayyorlanadigan joy', true),
('4b29fc40-ca47-1067-b31d-00dd010662db', 'Bar', 'Ichimliklar', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create Demo Menu Items
INSERT INTO public.menu_items (id, name, description, price, category_id, is_available, kitchen_station_id) VALUES
('5b29fc40-ca47-1067-b31d-00dd010662da', 'Osh', 'To''y oshi, qazi bilan', 35000, '6b29fc40-ca47-1067-b31d-00dd010662db', true, '4b29fc40-ca47-1067-b31d-00dd010662da'),
('5b29fc40-ca47-1067-b31d-00dd010662db', 'Qozon kabob', 'Qo''y go''shtidan', 45000, '6b29fc40-ca47-1067-b31d-00dd010662db', true, '4b29fc40-ca47-1067-b31d-00dd010662da'),
('5b29fc40-ca47-1067-b31d-00dd010662dc', 'Mastava', 'Qatiq bilan', 25000, '6b29fc40-ca47-1067-b31d-00dd010662da', true, '4b29fc40-ca47-1067-b31d-00dd010662da'),
('5b29fc40-ca47-1067-b31d-00dd010662dd', 'Choy', 'Qora yoki ko''k choy (choynak)', 5000, '6b29fc40-ca47-1067-b31d-00dd010662dc', true, '4b29fc40-ca47-1067-b31d-00dd010662db')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Demo Zones & Tables
INSERT INTO public.zones (id, name, description, is_active) VALUES
('1b29fc40-ca47-1067-b31d-00dd010662da', 'Asosiy zal', 'Katta zal', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tables (id, zone_id, table_number, status) VALUES
('2b29fc40-ca47-1067-b31d-00dd010662da', '1b29fc40-ca47-1067-b31d-00dd010662da', '1', 'available'),
('2b29fc40-ca47-1067-b31d-00dd010662db', '1b29fc40-ca47-1067-b31d-00dd010662da', '2', 'available'),
('2b29fc40-ca47-1067-b31d-00dd010662dc', '1b29fc40-ca47-1067-b31d-00dd010662da', '3', 'available')
ON CONFLICT (id) DO NOTHING;

-- 5. Create Demo Employees (PIN codes for login)
INSERT INTO public.employees (id, full_name, role, pin_code, is_active) VALUES
('3b29fc40-ca47-1067-b31d-00dd010662da', 'Demo Kassir', 'cashier', '222222', true),
('3b29fc40-ca47-1067-b31d-00dd010662db', 'Demo Ofitsiant', 'waiter', '333333', true)
ON CONFLICT (id) DO NOTHING;

-- Admin is intentionally skipped because Admin usually requires true auth sign-up to manage computer_devices properly in the new auth.users model
