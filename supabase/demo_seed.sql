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
