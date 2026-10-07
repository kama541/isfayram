import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmccbojtmvdazfdnyduh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2Nib2p0bXZkYXpmZG55ZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDUsImV4cCI6MjEwNTczMTkwNX0.2aVOMlgWzF1Q2OxEixvvLQr3OSNV63ec2SWUeJURNpA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: zones } = await supabase.from('table_zones').select('*');
  console.log('ZONES:', zones);
  const { data: tables } = await supabase.from('tables').select('*');
  console.log('TABLES:', tables);
}
run();
