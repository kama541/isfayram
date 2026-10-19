import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

// Category IDs
const shashlikCatId = 'c52eb283-f3d2-4419-a9aa-ad97ad21db1b'; // Shashliklar
const taomlarCatId = '3622d56f-7cce-4b82-8062-b72cb5db1b37';  // Taomlar
const baliqCatId = 'ec9bb937-5856-4fdd-8b1b-6b256dd74446';    // Baliqlar
const ichimlikCatId = '6b29fc40-ca47-1067-b31d-00dd010662dc'; // Ichimliklar

// Kitchen Station IDs
const shashlikStationId = '525ef16d-b118-4942-8617-41a90b39e64d'; // 🔥 Shashlik Room
const fishStationId = '16b9952b-1b9e-40f1-871f-2179ff167d3f';     // 🐟 Fish Room
const barStationId = '4b29fc40-ca47-1067-b31d-00dd010662db';      // 🥤 Bar

const itemsToAdd = [
  // ─── TAOMLAR - SHASHLIK ───────────────────────────────────────────
  {
    name: "Mol go'shtidan shashlik (kuskavoy)",
    price: 25000,
    category_id: shashlikCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Napoleon shashlik (kuskavoy)",
    price: 30000,
    category_id: shashlikCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Qiyma shashlik",
    price: 14000,
    category_id: shashlikCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Qiyma dolma",
    price: 18000,
    category_id: shashlikCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Tovuq file",
    price: 15000,
    category_id: shashlikCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Tovuq qanoti",
    price: 15000,
    category_id: shashlikCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Qo'y go'shtida kuskavoy",
    price: 35000,
    category_id: shashlikCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },

  // ─── TAOMLAR - OSH, SHO'RVA, TABAKA ───────────────────────────────
  {
    name: "Osh — (1 porsiya)",
    price: 25000,
    category_id: taomlarCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Qo'y go'shtidan sho'rva",
    price: 35000,
    category_id: taomlarCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Mol go'shtidan sho'rva",
    price: 30000,
    category_id: taomlarCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Dolmali sho'rva",
    price: 25000,
    category_id: taomlarCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },
  {
    name: "Tabaka — 1 kg",
    price: 65000,
    category_id: taomlarCatId,
    kitchen_station_id: shashlikStationId,
    is_available: true
  },

  // ─── BALIQ TAOMLARI ────────────────────────────────────────────────
  {
    name: "Buxarskiy baliq (qiltiriqsiz) — 1 kg",
    price: 90000,
    category_id: baliqCatId,
    kitchen_station_id: fishStationId,
    is_available: true
  },
  {
    name: "Buxarskiy baliq (qiltiriqsiz) — 0,5 kg",
    price: 45000,
    category_id: baliqCatId,
    kitchen_station_id: fishStationId,
    is_available: true
  },
  {
    name: "Oq baliq — 1 kg",
    price: 48000,
    category_id: baliqCatId,
    kitchen_station_id: fishStationId,
    is_available: true
  },
  {
    name: "Sazan — 1 kg",
    price: 68000,
    category_id: baliqCatId,
    kitchen_station_id: fishStationId,
    is_available: true
  },

  // ─── ICHIMLIKLAR - COCA-COLA ───────────────────────────────────────
  {
    name: "Coca-Cola 2 litr",
    price: 20000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },
  {
    name: "Coca-Cola 1,5 litr",
    price: 15000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },
  {
    name: "Coca-Cola 1 litr",
    price: 12000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },
  {
    name: "Coca-Cola 0,5 litr",
    price: 8000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },
  {
    name: "Coca-Cola butilkadagi",
    price: 6000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },

  // ─── ICHIMLIKLAR - FANTA ───────────────────────────────────────────
  {
    name: "Fanta 2 litr",
    price: 20000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },
  {
    name: "Fanta 1,5 litr",
    price: 15000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },
  {
    name: "Fanta 1 litr",
    price: 12000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },
  {
    name: "Fanta 0,5 litr",
    price: 8000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },

  // ─── ICHIMLIKLAR - OQ SUV ──────────────────────────────────────────
  {
    name: "Oq suv Gazli va gazsiz, 1,5 litr",
    price: 6000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },
  {
    name: "Oq suv Gazli va gazsiz, 1 litr",
    price: 5000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },
  {
    name: "Oq suv Gazli va gazsiz, 0,5 litr",
    price: 4000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  },

  // ─── ICHIMLIKLAR - CHOY ───────────────────────────────────────────
  {
    name: "Limonli choy",
    price: 10000,
    category_id: ichimlikCatId,
    kitchen_station_id: barStationId,
    is_available: true
  }
];

async function run() {
  console.log('1. Admin sifatida tizimga kirilmoqda...');
  
  let authRes = await supabase.auth.signInWithPassword({
    email: 'admin@isfayram.com',
    password: '111111'
  });

  if (authRes.error) {
    // Try with 181992
    authRes = await supabase.auth.signInWithPassword({
      email: 'admin@isfayram.com',
      password: '181992'
    });
  }

  if (authRes.error || !authRes.data.user) {
    console.error('Admin login muvaffaqiyatsiz:', authRes.error);
    process.exit(1);
  }

  console.log('Admin muvaffaqiyatli kirdi:', authRes.data.user.email);

  // Also update admin password in auth to 181992 if needed
  try {
    await supabase.auth.updateUser({ password: '181992' });
    console.log("Admin auth paroli ham '181992' ga yangilandi!");
  } catch (e) {
    console.warn("Auth parolini yangilashda ogohlantirish:", e.message);
  }

  console.log(`\n2. Jami ${itemsToAdd.length} ta taom bazaga kiritilmoqda...`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of itemsToAdd) {
    const { data: existing } = await supabase
      .from('menu_items')
      .select('id, name')
      .ilike('name', item.name)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('menu_items')
        .update({
          price: item.price,
          category_id: item.category_id,
          kitchen_station_id: item.kitchen_station_id,
          is_available: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) {
        console.error(`Xatolik [${item.name}]:`, error.message);
      } else {
        console.log(`[YANGILANDI] ${item.name} -> ${item.price.toLocaleString()} so'm`);
        updatedCount++;
      }
    } else {
      const { error } = await supabase
        .from('menu_items')
        .insert([{
          ...item,
          is_popular: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error(`Xatolik [${item.name}]:`, error.message);
      } else {
        console.log(`[QO'SHILDI] ${item.name} -> ${item.price.toLocaleString()} so'm`);
        insertedCount++;
      }
    }
  }

  console.log(`\nBarcha taomlar muvaffaqiyatli saqlandi! Qo'shildi: ${insertedCount}, Yangilandi: ${updatedCount}`);
}

run();
