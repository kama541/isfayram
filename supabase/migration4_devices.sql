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
