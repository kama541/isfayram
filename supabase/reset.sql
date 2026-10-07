-- Ushbu kodni Supabase'dagi SQL Editor'ga tashlab 'RUN' qiling.
-- Bu faqat tranzaksiyalar (buyurtmalar, xarajatlar, ombor tarixi) ni o'chiradi va hamma statistikalarni 0 qiladi.
-- Menyudagi taomlar, ofitsiantlar va stollar o'chmaydi!

TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE expenses RESTART IDENTITY CASCADE;
TRUNCATE TABLE inventory_transactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE waiter_calls RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE notebook_entries RESTART IDENTITY CASCADE;

UPDATE inventory_items SET current_stock = 0;
UPDATE tables SET status = 'available';
