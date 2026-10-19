-- Migration 5: Add cancelled orders metadata columns to orders table
-- Run this in Supabase SQL Editor:

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_by TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

COMMENT ON COLUMN public.orders.cancelled_at IS 'Vaqti qachon bekor qilingan';
COMMENT ON COLUMN public.orders.cancelled_by IS 'Kim tomonidan bekor qilingan (ism/lavozim)';
COMMENT ON COLUMN public.orders.cancellation_reason IS 'Buyurtma bekor qilinish sababi';
