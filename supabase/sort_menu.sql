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
