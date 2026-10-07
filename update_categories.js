import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmccbojtmvdazfdnyduh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2Nib2p0bXZkYXpmZG55ZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDUsImV4cCI6MjEwNTczMTkwNX0.2aVOMlgWzF1Q2OxEixvvLQr3OSNV63ec2SWUeJURNpA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const newNames = [
    'NON - CHOY',
    'BALIQ TAOMLARI',
    'SHIRINLIKLAR',
    'SALATLAR',
    'KABOBLAR',
    'OVQATLAR',
    'TABAKA',
    'TANDIR SOMSA',
    'SALQIN ICHIMLIKLAR'
  ];

  const { data: existingCats } = await supabase.from('menu_categories').select('*');
  console.log('Current categories:', existingCats.map(c => c.name));
  
  let handledNames = new Set();
  
  for (let cat of existingCats) {
      let matchedName = newNames.find(n => n.toLowerCase() === cat.name.toLowerCase());
      if (!matchedName && cat.name.toLowerCase() === 'salatlar') matchedName = 'SALATLAR';
      if (!matchedName && cat.name.toLowerCase() === 'shashliklar') matchedName = 'KABOBLAR';
      if (!matchedName && cat.name.toLowerCase() === 'taomlar') matchedName = 'OVQATLAR';
      
      if (matchedName && !handledNames.has(matchedName)) {
         await supabase.from('menu_categories').update({ name: matchedName }).eq('id', cat.id);
         handledNames.add(matchedName);
      } else {
         let nextName = newNames.find(n => !handledNames.has(n));
         if (nextName) {
           await supabase.from('menu_categories').update({ name: nextName }).eq('id', cat.id);
           handledNames.add(nextName);
         } else {
           // We have more existing than new, which is not true here (6 vs 9)
         }
      }
  }
  
  // Insert remaining new names
  for (let i = 0; i < newNames.length; i++) {
     let name = newNames[i];
     if (!handledNames.has(name)) {
        await supabase.from('menu_categories').insert({ name: name, sort_order: i + 1, is_active: true });
     } else {
        await supabase.from('menu_categories').update({ sort_order: i + 1 }).eq('name', name);
     }
  }
  
  console.log('Successfully updated categories in live database!');
}

run();
