-- Agar barcha ofitsiantlarga bir xil PIN kod (masalan 1111) qo'ymoqchi bo'lsangiz,
-- quyidagi 2 qatorni Supabase SQL Editor-da ishga tushiring:

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_pin_code_key;

UPDATE public.employees SET pin_code = '1111';


