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
