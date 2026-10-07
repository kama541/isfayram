import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmccbojtmvdazfdnyduh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2Nib2p0bXZkYXpmZG55ZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDUsImV4cCI6MjEwNTczMTkwNX0.2aVOMlgWzF1Q2OxEixvvLQr3OSNV63ec2SWUeJURNpA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: categories } = await supabase.from('menu_categories').select('*');
  
  const dummyItems = {
    'NON - CHOY': [
      { name: 'Non', price: 5000, description: 'Issiq tandir non' },
      { name: 'Qora choy', price: 5000, description: 'Limonli qora choy' },
      { name: 'Ko\'k choy', price: 5000, description: 'Ajoyib ko\'k choy' }
    ],
    'BALIQ TAOMLARI': [
      { name: 'Qovurilgan baliq', price: 45000, description: 'Sazan balig\'i' },
      { name: 'Dimlama baliq', price: 50000, description: 'Sabzavotli dimlama' }
    ],
    'SHIRINLIKLAR': [
      { name: 'Medoviy', price: 15000, description: 'Asalli tort' },
      { name: 'Napaleon', price: 15000, description: 'Mazzali shirinlik' }
    ],
    'SALATLAR': [
      { name: 'Achchiq-chuchuk', price: 12000, description: 'Pomidor va piyozli salat' },
      { name: 'Svejiy salat', price: 15000, description: 'Bodring va pomidor' }
    ],
    'KABOBLAR': [
      { name: 'Qiyma kabob', price: 12000, description: 'Mol go\'shtidan qiyma' },
      { name: 'Jaz kabob', price: 15000, description: 'Laxm go\'shtli jaz' },
      { name: 'Tovuq kabob', price: 10000, description: 'Mazzali tovuq kabob' }
    ],
    'OVQATLAR': [
      { name: 'Osh (Palov)', price: 30000, description: 'To\'y oshi' },
      { name: 'Manti', price: 25000, description: 'Go\'shtli manti (1 porsiya)' },
      { name: 'Qozon kabob', price: 45000, description: 'Mol go\'shti va kartoshka' }
    ],
    'TABAKA': [
      { name: 'Tabaka (butun)', price: 80000, description: 'Qovurilgan butun tovuq' },
      { name: 'Tabaka (yarim)', price: 40000, description: 'Yarim porsiya tovuq' }
    ],
    'TANDIR SOMSA': [
      { name: 'Go\'shtli somsa', price: 8000, description: 'Tandir somsa' }
    ],
    'SALQIN ICHIMLIKLAR': [
      { name: 'Coca-Cola (1L)', price: 12000, description: 'Muzdek ichimlik' },
      { name: 'Fanta (1L)', price: 12000, description: 'Muzdek ichimlik' },
      { name: 'Sharbat (Sok)', price: 15000, description: 'Mevali sharbat 1L' }
    ]
  };

  for (let cat of categories) {
    const items = dummyItems[cat.name];
    if (items) {
      for (let item of items) {
        // Check if item already exists to avoid duplicates
        const { data: existing } = await supabase.from('menu_items').select('*').eq('name', item.name).eq('category_id', cat.id);
        if (!existing || existing.length === 0) {
          await supabase.from('menu_items').insert({
            category_id: cat.id,
            name: item.name,
            price: item.price,
            description: item.description,
            is_available: true
          });
          console.log(`Inserted: ${item.name} into ${cat.name}`);
        }
      }
    }
  }
  console.log('Finished adding dummy menu items!');
}

run();
