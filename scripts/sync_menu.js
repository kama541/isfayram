import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmccbojtmvdazfdnyduh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2Nib2p0bXZkYXpmZG55ZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDUsImV4cCI6MjEwNTczMTkwNX0.2aVOMlgWzF1Q2OxEixvvLQr3OSNV63ec2SWUeJURNpA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMenuAndStations() {
  console.log('--- 0. AUTHENTICATE AS ADMIN ---');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@isfayram.com',
    password: '181992'
  });
  if (authErr || !auth?.user) {
    throw new Error('Admin authentication failed: ' + authErr?.message);
  }
  console.log('Admin authenticated successfully:', auth.user.email);

  console.log('--- 1. ENSURE KITCHEN STATIONS (SEXLAR) ---');
  await supabase.from('kitchen_stations').update({
    name: '🍲 Asosiy Oshxona',
    description: 'Issiq ovqatlar, shoʻrvalar, tabaka va salatlar sexi',
    is_active: true
  }).eq('id', '4b29fc40-ca47-1067-b31d-00dd010662da');

  await supabase.from('kitchen_stations').update({
    name: '🔥 Shashlik Room',
    description: 'Kabob va mangal taomlari sexi',
    is_active: true
  }).eq('id', '525ef16d-b118-4942-8617-41a90b39e64d');

  await supabase.from('kitchen_stations').update({
    name: '🐟 Fish Room',
    description: 'Baliq taomlari sexi',
    is_active: true
  }).eq('id', '16b9952b-1b9e-40f1-871f-2179ff167d3f');

  await supabase.from('kitchen_stations').update({
    name: '🫓 Tandir',
    description: 'Tandir somsa va non sexi',
    is_active: true
  }).eq('id', 'cd884f76-4022-4ae0-863e-a6f4405fae61');

  await supabase.from('kitchen_stations').update({
    name: '🥤 Bar',
    description: 'Salqin ichimliklar, choylar va shirinliklar',
    is_active: true
  }).eq('id', '4b29fc40-ca47-1067-b31d-00dd010662db');

  const STATIONS = {
    SHASHLIK: '525ef16d-b118-4942-8617-41a90b39e64d',
    BALIQ: '16b9952b-1b9e-40f1-871f-2179ff167d3f',
    TANDIR: 'cd884f76-4022-4ae0-863e-a6f4405fae61',
    OSHXONA: '4b29fc40-ca47-1067-b31d-00dd010662da',
    BAR: '4b29fc40-ca47-1067-b31d-00dd010662db'
  };

  console.log('--- 2. SYNC CATEGORIES ---');
  // Target categories in order from Image 2:
  const targetCategories = [
    { name: 'BALIQ TAOMLARI', sort_order: 1 },
    { name: 'KABOBLAR', sort_order: 2 },
    { name: 'NON - CHOY', sort_order: 3 },
    { name: 'OVQATLAR', sort_order: 4 },
    { name: 'SALATLAR', sort_order: 5 },
    { name: 'SALQIN ICHIMLIKLAR', sort_order: 6 },
    { name: 'TABAKA', sort_order: 7 },
    { name: 'TANDIR SOMSA', sort_order: 8 },
    { name: 'SHIRINLIKLAR', sort_order: 9 }
  ];

  const { data: existingCategories } = await supabase.from('menu_categories').select('*');
  const catMap = {}; // name -> id

  const renameMapping = {
    'baliqlar': 'BALIQ TAOMLARI',
    'baliq taomlari': 'BALIQ TAOMLARI',
    'shashliklar': 'KABOBLAR',
    'kaboblar': 'KABOBLAR',
    'ichimliklar': 'SALQIN ICHIMLIKLAR',
    'salqin ichimliklar': 'SALQIN ICHIMLIKLAR',
    'salatlar': 'SALATLAR',
    'taomlar': 'OVQATLAR',
    'ovqatlar': 'OVQATLAR',
    'suyuq taomlar': 'NON - CHOY',
    'non - choy': 'NON - CHOY',
    'quyuq taomlar': 'TANDIR SOMSA',
    'tandir somsa': 'TANDIR SOMSA',
    'tabaka': 'TABAKA',
    'shirinliklar': 'SHIRINLIKLAR'
  };

  for (const cat of existingCategories || []) {
    const lower = cat.name.toLowerCase();
    const targetName = renameMapping[lower] || targetCategories.find(t => t.name.toLowerCase() === lower)?.name;
    if (targetName) {
      const targetObj = targetCategories.find(t => t.name === targetName);
      await supabase.from('menu_categories').update({
        name: targetName,
        sort_order: targetObj?.sort_order || 1,
        is_active: true
      }).eq('id', cat.id);
      catMap[targetName] = cat.id;
    }
  }

  // Insert missing categories
  for (const t of targetCategories) {
    if (!catMap[t.name]) {
      const { data: inserted, error } = await supabase.from('menu_categories').insert({
        name: t.name,
        sort_order: t.sort_order,
        is_active: true
      }).select().single();
      if (inserted) {
        catMap[t.name] = inserted.id;
        console.log(`Created category: ${t.name} -> ${inserted.id}`);
      } else {
        console.error('Insert cat error:', error);
      }
    }
  }

  console.log('Categories synced:', catMap);

  console.log('--- 3. DEFINE COMPLETE MENU ITEMS ---');
  // All items categorized and assigned to their respective workshop/sex
  const menuData = [
    // 🐟 BALIQ TAOMLARI (7 items) -> Fish Room
    { name: 'BUXARSKIY BALIQ 1kg', price: 90000, category: 'BALIQ TAOMLARI', station: STATIONS.BALIQ, is_available: true },
    { name: 'BUXARSKIY BALIQ PORCIYA', price: 45000, category: 'BALIQ TAOMLARI', station: STATIONS.BALIQ, is_available: true },
    { name: 'MARINKA 1 KG', price: 130000, category: 'BALIQ TAOMLARI', station: STATIONS.BALIQ, is_available: true },
    { name: 'MARINKA PORSYA', price: 65000, category: 'BALIQ TAOMLARI', station: STATIONS.BALIQ, is_available: true },
    { name: 'OQ BALIQ 1kg', price: 48000, category: 'BALIQ TAOMLARI', station: STATIONS.BALIQ, is_available: true },
    { name: 'SAZAN 1kg', price: 68000, category: 'BALIQ TAOMLARI', station: STATIONS.BALIQ, is_available: true },
    { name: 'SAZAN PORSIYA', price: 34000, category: 'BALIQ TAOMLARI', station: STATIONS.BALIQ, is_available: true },

    // 🔥 KABOBLAR (15 items) -> Shashlik Room
    { name: 'BOMBA', price: 20000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: true },
    { name: 'DOLMA QIYMA', price: 20000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: false }, // Stop
    { name: 'JIGAR SHASHLIK', price: 13000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: true },
    { name: 'KUSKAVOY MOL GOSHT', price: 25000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: true },
    { name: 'KUSKAVOY QOY GOSHT', price: 35000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: false }, // Stop
    { name: 'ORAMA SHASHLIK', price: 35000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: false }, // Stop
    { name: 'PAQILDOK', price: 15000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: true },
    { name: 'POLVON SHASHLIK', price: 20000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: true },
    { name: 'QIYMA NAPALON', price: 30000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: false }, // Stop
    { name: 'QIYMA SHASHLIK', price: 14000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: true },
    { name: 'QOY DANDANA', price: 40000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: false }, // Stop
    { name: 'SIRLI SHASHLIK', price: 22000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: false }, // Stop
    { name: 'SSR QIYMA', price: 18000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: false }, // Stop
    { name: 'TOVUQ FILE', price: 15000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: true },
    { name: 'TOVUQ QANOTI', price: 12000, category: 'KABOBLAR', station: STATIONS.SHASHLIK, is_available: true },

    // 🫓 NON - CHOY (4 items) -> Bar / Tandir
    { name: 'CHOY', price: 2000, category: 'NON - CHOY', station: STATIONS.BAR, is_available: true },
    { name: 'LIMON CHOY', price: 10000, category: 'NON - CHOY', station: STATIONS.BAR, is_available: true },
    { name: 'NON', price: 5000, category: 'NON - CHOY', station: STATIONS.TANDIR, is_available: true },
    { name: 'NON 0.5', price: 3000, category: 'NON - CHOY', station: STATIONS.TANDIR, is_available: true },

    // 🍲 OVQATLAR (5 items) -> Asosiy Oshxona
    { name: '5 BARMOQ', price: 50000, category: 'OVQATLAR', station: STATIONS.OSHXONA, is_available: false }, // Stop
    { name: 'OSH', price: 25000, category: 'OVQATLAR', station: STATIONS.OSHXONA, is_available: true },
    { name: 'SHORVA 0.7', price: 25000, category: 'OVQATLAR', station: STATIONS.OSHXONA, is_available: true },
    { name: 'SHORVA MOL GOSHTI', price: 30000, category: 'OVQATLAR', station: STATIONS.OSHXONA, is_available: true },
    { name: 'SHORVA QOY GOSHTI', price: 35000, category: 'OVQATLAR', station: STATIONS.OSHXONA, is_available: true },

    // 🥗 SALATLAR (7 items) -> Asosiy Oshxona
    { name: 'AKROSHKA', price: 7000, category: 'SALATLAR', station: STATIONS.OSHXONA, is_available: true },
    { name: 'SHAKAROB', price: 7000, category: 'SALATLAR', station: STATIONS.OSHXONA, is_available: true },
    { name: 'SUZMA', price: 7000, category: 'SALATLAR', station: STATIONS.OSHXONA, is_available: true },
    { name: 'SVEJIY', price: 7000, category: 'SALATLAR', station: STATIONS.OSHXONA, is_available: true },
    { name: 'TUZLAMA', price: 7000, category: 'SALATLAR', station: STATIONS.OSHXONA, is_available: true },
    { name: 'ACHCHIQ-CHUCHUK', price: 7000, category: 'SALATLAR', station: STATIONS.OSHXONA, is_available: true },
    { name: 'FRANSUZCHA SALAT', price: 15000, category: 'SALATLAR', station: STATIONS.OSHXONA, is_available: true },

    // 🥤 SALQIN ICHIMLIKLAR (19 items) -> Bar
    { name: 'ANOR 0.5', price: 5000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'ANOR 1.5L', price: 13000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'CHORTOQ BUTILKA', price: 10000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'COLA 0.5L', price: 8000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'COLA 1L', price: 13000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'COLA 1.5L', price: 15000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'COLA 2L', price: 20000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'FANTA 0.5L', price: 8000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'FANTA 1L', price: 13000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'FANTA 1.5L', price: 15000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'FANTA 2L', price: 20000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'KAVSAR 1.5 L', price: 8000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'LIPTON 1 L', price: 13000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'LIPTON 1.5 L', price: 16000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'OQ SUV 0.5L', price: 4000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'OQ SUV 1L', price: 5000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'OQ SUV 1.5L', price: 6000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'PARTY 0.3', price: 6000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'SOK 1 L', price: 15000, category: 'SALQIN ICHIMLIKLAR', station: STATIONS.BAR, is_available: true },

    // 🍗 TABAKA (2 items) -> Asosiy Oshxona
    { name: 'TABAKA 0.5', price: 35000, category: 'TABAKA', station: STATIONS.OSHXONA, is_available: true },
    { name: 'TABAKA BUTUN', price: 70000, category: 'TABAKA', station: STATIONS.OSHXONA, is_available: true },

    // 🥟 TANDIR SOMSA (3 items) -> Tandir
    { name: 'KOTTA SOMSA', price: 25000, category: 'TANDIR SOMSA', station: STATIONS.TANDIR, is_available: true },
    { name: 'SOMSA MOL GOSHT', price: 13000, category: 'TANDIR SOMSA', station: STATIONS.TANDIR, is_available: true },
    { name: 'SOMSA QOY GOSHT', price: 15000, category: 'TANDIR SOMSA', station: STATIONS.TANDIR, is_available: false }, // Stop

    // 🍰 SHIRINLIKLAR (12 items) -> Bar
    { name: 'BUTUN TORT', price: 170000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'MEDOVIK', price: 25000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'MICADO', price: 25000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'NAPALION', price: 25000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'NAPALION (KATTA)', price: 35000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: false }, // Stop
    { name: 'PRAYSIL', price: 25000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'SAN SEBASTAN', price: 25000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'SNICKERS', price: 25000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'TART', price: 10000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'TWIX', price: 25000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'PISTA', price: 50000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true },
    { name: 'CHEESECAKE', price: 25000, category: 'SHIRINLIKLAR', station: STATIONS.BAR, is_available: true }
  ];

  console.log(`Total items to populate: ${menuData.length}`);

  // Fetch current menu items
  const { data: currentItems } = await supabase.from('menu_items').select('*');
  const { data: orderItemRefs } = await supabase.from('order_items').select('menu_item_id');
  const referencedIds = new Set(orderItemRefs?.map(o => o.menu_item_id) || []);

  const reusedMap = {
    '5b29fc40-ca47-1067-b31d-00dd010662db': '5 BARMOQ',
    'ba04c286-66b4-4593-9ee2-50bf0d9b0c59': 'COLA 1L',
    '5b29fc40-ca47-1067-b31d-00dd010662dc': 'SHORVA 0.7',
    '5b29fc40-ca47-1067-b31d-00dd010662da': 'OSH',
    '5b29fc40-ca47-1067-b31d-00dd010662dd': 'CHOY'
  };

  const processedNames = new Set();

  for (const [id, targetName] of Object.entries(reusedMap)) {
    const itemDef = menuData.find(m => m.name === targetName);
    if (itemDef) {
      await supabase.from('menu_items').update({
        name: itemDef.name,
        price: itemDef.price,
        category_id: catMap[itemDef.category],
        kitchen_station_id: itemDef.station,
        is_available: itemDef.is_available
      }).eq('id', id);
      processedNames.add(targetName);
      console.log(`Reused referenced ID ${id} for "${targetName}"`);
    }
  }

  // Delete all other unreferenced existing items
  for (const item of currentItems || []) {
    if (!referencedIds.has(item.id)) {
      await supabase.from('menu_items').delete().eq('id', item.id);
    }
  }
  console.log('Cleaned up unreferenced legacy items.');

  // Now insert the remaining items
  for (const itemDef of menuData) {
    if (processedNames.has(itemDef.name)) continue;

    const catId = catMap[itemDef.category];
    if (!catId) {
      console.error(`Category not found for ${itemDef.category}`);
      continue;
    }

    const { data: inserted, error } = await supabase.from('menu_items').insert({
      name: itemDef.name,
      price: itemDef.price,
      category_id: catId,
      kitchen_station_id: itemDef.station,
      is_available: itemDef.is_available,
      is_popular: ['OSH', 'BOMBA', 'COLA 1.5L', 'KUSKAVOY MOL GOSHT', 'BUXARSKIY BALIQ 1kg', 'SOMSA MOL GOSHT', 'SHORVA MOL GOSHTI'].includes(itemDef.name)
    }).select().single();

    if (error) {
      console.error(`Error inserting ${itemDef.name}:`, error);
    } else {
      console.log(`Inserted: ${itemDef.name} (${itemDef.category} - ${itemDef.price})`);
    }
  }

  console.log('--- ALL DONE SUCCESSFULLY! ---');
}

syncMenuAndStations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
