import { createClient } from '@supabase/supabase-js';

const URL = 'https://dmccbojtmvdazfdnyduh.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtY2Nib2p0bXZkYXpmZG55ZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDUsImV4cCI6MjEwNTczMTkwNX0.2aVOMlgWzF1Q2OxEixvvLQr3OSNV63ec2SWUeJURNpA';

// Anonymous clients exactly like PIN-logged-in staff (no Supabase Auth session)
const cashier = createClient(URL, KEY);
const waiter = createClient(URL, KEY);

let got = null;
const ch = cashier.channel('probe-orders')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, p => { got = p.new; })
  .subscribe(s => console.log('cashier channel status:', s));

await new Promise(r => setTimeout(r, 2500));
const { data: t } = await waiter.from('tables').select('id,table_number').limit(1).single();
const { data: o, error } = await waiter.from('orders').insert({ table_id: null, status: 'new', total_amount: 1 }).select().single();
console.log('anon insert:', o?.id, error?.message);
for (let i = 0; i < 20 && !got; i++) await new Promise(r => setTimeout(r, 250));
console.log('anon realtime INSERT received:', Boolean(got), got?.id === o?.id);
if (o) await waiter.from('orders').delete().eq('id', o.id);
await cashier.removeChannel(ch);
process.exit(0);
