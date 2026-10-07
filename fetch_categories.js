import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmccbojtmvdazfdnyduh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2Nib2p0bXZkYXpmZG55ZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDUsImV4cCI6MjEwNTczMTkwNX0.2aVOMlgWzF1Q2OxEixvvLQr3OSNV63ec2SWUeJURNpA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: categories, error: catError } = await supabase.from('menu_categories').select('*');
  console.log('Current categories:', categories);
  
  const { data: items, error: itemError } = await supabase.from('menu_items').select('*');
  console.log('Current menu items count:', items?.length);
}

run();
