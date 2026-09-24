-- ==========================================
-- DUMMY DATA FOR RESTAURANT POS
-- ==========================================

-- We don't populate `profiles` here because they need to be linked to `auth.users` via Supabase Auth.
-- But we will populate zones, tables, and menu items to get started!

-- 1. ZONES
INSERT INTO public.zones (id, name, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'Ko''cha', 'Ochiq havodagi joylar'),
('22222222-2222-2222-2222-222222222222', 'Ichki zal', 'Asosiy zal'),
('33333333-3333-3333-3333-333333333333', 'Kabinkalar', 'Alohida VIP xonalar');

-- 2. TABLES
INSERT INTO public.tables (id, zone_id, table_number, capacity, status) VALUES 
('41111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '1', 4, 'available'),
('41111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', '2', 4, 'available'),
('42222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', '10', 6, 'available'),
('42222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '11', 2, 'occupied'),
('43333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'VIP-1', 10, 'available');

-- 3. MENU CATEGORIES
INSERT INTO public.menu_categories (id, name, sort_order) VALUES 
('51111111-1111-1111-1111-111111111111', 'Milliy Taomlar', 1),
('52222222-2222-2222-2222-222222222222', 'Fast Food', 2),
('53333333-3333-3333-3333-333333333333', 'Ichimliklar', 3);

-- 4. MENU ITEMS
INSERT INTO public.menu_items (id, category_id, name, description, price, image_url, is_available) VALUES 
('61111111-1111-1111-1111-111111111111', '51111111-1111-1111-1111-111111111111', 'Osh (Palov)', 'Maxsus to''y oshi, qo''y go''shtidan tayyorlangan', 35000, 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=800', true),
('61111111-1111-1111-1111-111111111112', '51111111-1111-1111-1111-111111111111', 'Qozonkabob', 'Qarsildoq qovurilgan go''sht va kartoshka', 45000, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800', true),
('61111111-1111-1111-1111-111111111113', '51111111-1111-1111-1111-111111111111', 'Manti', 'Qo''y go''shti va piyozli manti', 30000, 'https://images.unsplash.com/photo-1563379926898-05f45c514d68?auto=format&fit=crop&q=80&w=800', true),
('62222222-2222-2222-2222-222222222221', '52222222-2222-2222-2222-222222222222', 'Cheeseburger', 'Mol go''shtidan kotlet va pishloq', 25000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800', true),
('62222222-2222-2222-2222-222222222222', '52222222-2222-2222-2222-222222222222', 'Pizza Pepperoni', 'Katta o''lchamli italyancha pizza', 65000, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800', true),
('63333333-3333-3333-3333-333333333331', '53333333-3333-3333-3333-333333333333', 'Coca-Cola 1L', 'Muzdek ichimlik', 12000, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800', true),
('63333333-3333-3333-3333-333333333332', '53333333-3333-3333-3333-333333333333', 'Choy (Qora/Ko''k)', 'Limonli choy', 5000, 'https://images.unsplash.com/photo-1576092762791-dd9e2220cad1?auto=format&fit=crop&q=80&w=800', true);

-- Enable realtime for tables, orders, and waiter_calls so the UI updates automatically
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE waiter_calls;
