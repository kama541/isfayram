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
