-- ========================================================
-- ISFAYRAM POS - BARCHA OFITSIANTLAR VA XODIMLAR SOZLAMALARI
-- ========================================================

-- 1. PIN kod takrorlanishi mumkin bo'lishi uchun UNIQUE cheklovni olib tashlash:
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_pin_code_key;

-- 2. Demo xodimlarni butunlay o'chirish:
DELETE FROM public.employees WHERE full_name LIKE 'Demo%';

-- 3. Barcha 4 nafar ofitsiantni 1111 PIN kodi bilan qayta tiklash:
INSERT INTO public.employees (id, full_name, role, pin_code, is_active, kitchen_station_ids)
VALUES 
  ('8004c317-e701-432e-92c8-5d439ba40951', 'Aziz', 'waiter', '1111', true, '[]'::jsonb),
  ('b30659be-8f6c-494b-ba96-9af707a69847', 'Dilnoz', 'waiter', '1111', true, '[]'::jsonb),
  ('ed7920cb-e078-40d9-90f9-e979641d430b', 'M.Bilol', 'waiter', '1111', true, '[]'::jsonb),
  ('7e89fd65-d1e8-481b-ac20-f4c8160a8090', 'Xidoyat', 'waiter', '1111', true, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  pin_code = '1111',
  is_active = true;

-- 4. Barcha ofitsiantlarning PIN kodini 1111 ga o'rnatish:
UPDATE public.employees SET pin_code = '1111';
